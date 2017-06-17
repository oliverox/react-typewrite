import React, { Component } from 'react';
import PropTypes from 'prop-types';

const ERASE = -1,
  TYPE = 1;

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.resetCounters();
    this.uniqueClassName =
      'tw-' +
      Math.floor(Math.random() * 0x100) +
      '-' +
      Math.floor(Math.random() * 0x100);
    this.state = {
      toRender: (
        <span key="0" className={this.uniqueClassName}>
          {props.defaultElement}
        </span>
      )
    };
  }

  componentWillMount() {
    this.injectStyles();
  }

  componentDidMount() {
    if (!this.props.pause) {
      this.start();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pause !== this.props.pause && !this.props.pause) {
      this.start();
    }
  }

  resetCounters() {
    this.key = 0; // Assign a unique key to each element inside arrays
    this.totalCharCount = 0; // Total number of characters
    this.currentCharIndex = 0; // Points to the current character index
    this.targetCharIndex = 0; // Points to the targeted character index
    this.targetCharIndexBeforeErase = 0; // Store the target character index before erasing word
    this.mode = TYPE; // 1 => typing, -1 => erasing
  }

  start() {
    const { cycle, cycleType, defaultElement, children } = this.props;
    if (cycle) {
      const self = this, childrenArr = React.Children.toArray(children);
      if (defaultElement !== '') {
        childrenArr.unshift(defaultElement);
        this.currentCharIndex = self.calculateCharacterCount(defaultElement);
        this.targetCharIndex = this.currentCharIndex;
        this.mode = ERASE;
      }
      (function loopChildren(index) {
        // Setup tree
        self.prepareElementsForTyping(childrenArr[index]);

        // Start typing animation for current child
        new Promise(resolve => {
          if (childrenArr[index] === ' ') {
            resolve();
          } else {
            self.beginTyping(resolve);
          }
        }).then(() => {
          if (index >= childrenArr.length - 1) {
            self.endTyping();
          } else {
            if (cycleType === 'erase') {
              self.mode = -self.mode;
              if (self.mode === ERASE) {
                loopChildren(index);
              } else {
                self.resetCounters();
                loopChildren(index + 1);
              }
            }
          }
        });
      })(0);
    } else {
      // Setup tree
      this.prepareElementsForTyping(children);

      // Start typing animation
      new Promise(resolve => {
        this.beginTyping(resolve);
      }).then(() => {
        this.endTyping();
      });
    }
  }

  prepareElementsForTyping(children) {
    // Set the VDOM tree root
    this.createVDOMTree(children);

    // Calculate and store character and word counts
    this.setTotalCharacterCount(this.calculateCharacterCount(this.root));

    // Set pointer to next target character
    this.setNextTargetCharacterIndex();

    // Build tree from root element
    this.tree = this.buildTree(this.root);
  }

  createVDOMTree(childrenArr) {
    const { className } = this.props;
    this.root = (
      <span
        key="0"
        className={
          className
            ? `${className} ${this.uniqueClassName}`
            : this.uniqueClassName
        }
      >
        {React.Children.toArray(childrenArr)}
      </span>
    );
  }

  // Set total character count
  setTotalCharacterCount(charCount) {
    this.totalCharCount = charCount;
  }

  // Returns total number of characters to type
  getTotalCharacterCount() {
    return this.totalCharCount;
  }

  // Returns the index of the  currently targeted character
  getTargetCharacterIndex() {
    return this.targetCharIndex;
  }

  // Sets the target pointer to its next position
  setNextTargetCharacterIndex() {
    this.mode === ERASE ? this.targetCharIndex-- : this.targetCharIndex++;
  }

  // Calculate total characters and words
  calculateCharacterCount(el, charCount = 0) {
    const self = this;
    if (el === ' ') {
      charCount++;
    } else {
      React.Children.forEach(el.props.children, child => {
        if (typeof child === 'string') {
          charCount += child.length;
        } else {
          charCount = self.calculateCharacterCount(child, charCount);
        }
      });
    }
    return charCount;
  }

  // Returns a random delay
  getDelay() {
    const { maxTypingDelay, minTypingDelay } = this.props;
    const maxMinusMin = Math.abs(maxTypingDelay - minTypingDelay);
    return Math.floor(Math.random() * (maxMinusMin + 1)) + minTypingDelay;
  }

  // Start typing characters
  beginTyping(mainResolve) {
    const self = this, { eraseDelay, startTypingDelay } = this.props;
    function typeNextCharacter() {
      const targetCharIndex = self.getTargetCharacterIndex();
      // debugger;
      if (
        (self.mode === TYPE && targetCharIndex > self.getTotalCharacterCount()) ||
        (self.mode === ERASE && targetCharIndex < 0)
      ) {
        return mainResolve();
      } else {
        const delay = self.getDelay();
        self.currentCharIndex = 0;
        new Promise(resolve => {
          const newTree = self.duplicateTree(self.tree);
          const toRender = self.generateRenderTree(newTree);
          setTimeout(() => {
            self.setState({ toRender });
            self.setNextTargetCharacterIndex();
            resolve();
          }, delay);
        }).then(typeNextCharacter);
      }
    }
    if (this.mode === ERASE) {
      if (eraseDelay > 0) {
        setTimeout(() => {
          typeNextCharacter();
        }, eraseDelay);
      } else {
        typeNextCharacter();
      }
    } else {
      if (startTypingDelay > 0) {
        setTimeout(() => {
          typeNextCharacter();
        }, startTypingDelay);
      } else {
        typeNextCharacter();
      }
    }
  }

  endTyping() {
    const { hideCursorDelay, onTypingDone } = this.props;
    hideCursorDelay > -1 && this.hideCursor();
    onTypingDone();
  }

  // Build tree representation of VDOM
  buildTree(el) {
    const self = this;
    if (Array.isArray(el)) {
      return el.map(child => {
        return self.buildTree(child);
      });
    } else if (typeof el === 'string') {
      return {
        el: 'string',
        children: el
      };
    } else if (React.isValidElement(el)) {
      const { children, ...otherProps } = el.props;
      return {
        el: el.type,
        key: this.key++,
        props: otherProps,
        children: self.buildTree(children)
      };
    }
  }

  // Gradually duplicate the current tree one character / word at a time
  duplicateTree(tree) {
    const self = this,
      currentCharIndex = self.currentCharIndex,
      targetCharIndex = self.getTargetCharacterIndex();
    if (tree.el === 'string') {
      if (currentCharIndex + tree.children.length < targetCharIndex) {
        self.currentCharIndex += tree.children.length;
        return tree;
      } else {
        self.currentCharIndex = targetCharIndex;
        return {
          el: tree.el,
          children: tree.children.slice(0, targetCharIndex - currentCharIndex)
        };
      }
    } else if (tree.el && tree.el !== 'string') {
      return {
        el: tree.el,
        props: tree.props,
        key: tree.key,
        children: self.duplicateTree(tree.children)
      };
    } else if (Array.isArray(tree)) {
      return tree
        .map(child => {
          return self.duplicateTree(child);
        })
        .filter(child => {
          return child !== null && typeof child !== 'undefined';
        });
    }
  }

  // Hide the cursor after typing is done
  hideCursor() {
    const self = this,
      { className } = this.props,
      newClassName = className ? `${className} tw-done` : 'tw-done',
      toRender = React.cloneElement(
        this.state.toRender,
        Object.assign({}, { className: newClassName })
      );
    setTimeout(() => {
      self.setState({
        toRender
      });
    }, this.props.hideCursorDelay);
  }

  // Inject styling
  injectStyles() {
    const style = document.createElement('style'),
      { cursorColor, cursorWidth } = this.props;
    style.innerHTML = `.${this.uniqueClassName}>*{display:inline}.${this.uniqueClassName}:after{position:relative;content:" ";top:-1px;border-right:0;border-left:${cursorWidth}px solid;margin-left:5px;-webkit-animation:1s blink-${this.uniqueClassName} step-end infinite;-moz-animation:1s blink-${this.uniqueClassName} step-end infinite;-ms-animation:1s blink-${this.uniqueClassName} step-end infinite;-o-animation:1s blink-${this.uniqueClassName} step-end infinite;animation:1s blink-${this.uniqueClassName} step-end infinite}@keyframes blink-${this.uniqueClassName}{from,to{color:transparent}50%{color:${cursorColor}}}@-moz-keyframes blink-${this.uniqueClassName}{from,to{color:transparent}50%{color:${cursorColor}}}@-webkit-keyframes blink-${this.uniqueClassName}{from,to{color:transparent}50%{color:${cursorColor}}}@-ms-keyframes "blink-${this.uniqueClassName}"{from,to{color:transparent}50%{color:${cursorColor}}}@-o-keyframes blink-${this.uniqueClassName}{from,to{color:transparent}50%{color:${cursorColor}}}.${this.uniqueClassName}.tw-done:after{opacity:0}`;
    document.head.appendChild(style);
  }

  // Convert tree back to VDOM
  generateRenderTree(tree) {
    const self = this;
    if (tree.el === 'string') {
      return tree.children;
    } else if (Array.isArray(tree)) {
      return tree.map(child => {
        return self.generateRenderTree(child);
      });
    } else if (typeof tree === 'object' && tree.el) {
      const {
        pause,
        hideCursorDelay,
        minTypingDelay,
        maxTypingDelay,
        onTypingDone,
        ...otherProps
      } = tree.props;
      return (
        <tree.el key={tree.key} {...otherProps}>
          {self.generateRenderTree(tree.children)}
        </tree.el>
      );
    } else {
      throw new Error('Invalid tree', tree);
    }
  }

  render() {
    return this.state.toRender;
  }
}

Typewrite.defaultProps = {
  cycle: false,
  eraseDelay: 2000,
  startTypingDelay: 0,
  cycleType: 'erase',
  pause: false,
  defaultElement: '',
  minTypingDelay: 30,
  maxTypingDelay: 30,
  hideCursorDelay: -1,
  cursorColor: '#000',
  cursorWidth: 2,
  onTypingDone: () => {
    console.log('Typing done.');
  }
};

Typewrite.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.array
  ]).isRequired,
  cycle: PropTypes.bool,
  eraseDelay: PropTypes.number,
  startTypingDelay: PropTypes.number,
  cycleType: PropTypes.oneOf(['erase', 'reset']),
  pause: PropTypes.bool,
  className: PropTypes.string,
  onTypingDone: PropTypes.func,
  defaultElement: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  minTypingDelay: PropTypes.number,
  maxTypingDelay: PropTypes.number,
  hideCursorDelay: PropTypes.number,
  cursorColor: PropTypes.string,
  cursorWidth: PropTypes.number
};

export default Typewrite;
