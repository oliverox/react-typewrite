import React, { Component } from 'react';
import PropTypes from 'prop-types';
const TYPING = 1, ERASING = -1;

// Calculate total characters and words
const calculateCharacterCount = (el, charCount = 0) => {
  if (el === ' ') {
    charCount++;
  } else {
    React.Children.forEach(el.props.children, child => {
      if (typeof child === 'string') {
        charCount += child.length;
      } else {
        charCount = calculateCharacterCount(child, charCount);
      }
    });
  }
  return charCount;
}

// Build tree representation of VDOM
const buildTree = (el, key = 0) => {
  if (Array.isArray(el)) {
    return el.map(child => {
      return buildTree(child, key + 1);
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
      key,
      props: otherProps,
      children: buildTree(children, key + 1)
    };
  }
}


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
    this.mode = TYPING; // 1 => typing, -1 => erasing
  }

  start() {
    const { cycle, cycleType, defaultElement, children } = this.props;
    if (cycle) {
      const self = this, childrenArr = React.Children.toArray(children);
      if (defaultElement !== '') {
        childrenArr.unshift(defaultElement);
        this.currentCharIndex = calculateCharacterCount(defaultElement);
        this.targetCharIndex = this.currentCharIndex;
        this.mode = ERASING;
      }
      (function loopChildren(index) {
        // Setup tree
        self.prepareElementsForTyping(childrenArr[index]);

        // Start typing animation for current child
        self.typeWrite().then(() => {
          if (index >= childrenArr.length - 1) {
            self.end();
          } else {
            if (cycleType === 'erase') {
              self.mode = -self.mode;
              if (self.mode === ERASING) {
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
      this.typeWrite().then((this.end).bind(this));
    }
  }

  prepareElementsForTyping(children) {
    // Set the VDOM tree root
    this.createVDOMTree(children);

    // Calculate and store character and word counts
    this.setTotalCharacterCount(calculateCharacterCount(this.root));

    // Set pointer to next target character
    this.setNextTargetCharacterIndex();

    // Build tree from root element
    this.tree = buildTree(this.root);
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
    this.mode === ERASING ? this.targetCharIndex-- : this.targetCharIndex++;
  }

  typeNextCharacter(mainResolve) {
    return () => {
      const self = this;
      const targetCharIndex = self.getTargetCharacterIndex();
      if (
        (self.mode === TYPING && targetCharIndex > self.getTotalCharacterCount()) ||
        (self.mode === ERASING && targetCharIndex < 0)
      ) {
        return mainResolve();
      } else {
        const delay = self.props.typingDelay;
        self.currentCharIndex = 0;
        new Promise(resolve => {
          const newTree = self.duplicateTree(self.tree);
          const toRender = self.generateRenderTree(newTree);
          setTimeout(() => {
            self.setState({ toRender });
            self.setNextTargetCharacterIndex();
            resolve();
          }, delay);
        }).then(self.typeNextCharacter(mainResolve));
      }
    }
  }

  typeWrite() {
    const self = this, { eraseDelay, startTypingDelay } = this.props;
    return new Promise(resolve => {
      if (this.mode === ERASING) {
        if (eraseDelay > 0) {
          setTimeout(self.typeNextCharacter(resolve), eraseDelay);
        } else {
          self.typeNextCharacter(resolve)();
        }
      } else {
        if (startTypingDelay > 0) {
          setTimeout(self.typeNextCharacter(resolve), startTypingDelay);
        } else {
          self.typeNextCharacter(resolve)();
        }
      }
    });
  }

  end() {
    const { hideCursorDelay, onTypingDone } = this.props;
    hideCursorDelay > -1 && this.hideCursor();
    onTypingDone();
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
        typingDelay,
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
  typingDelay: 30,
  hideCursorDelay: -1,
  cursorColor: '#000',
  cursorWidth: 2,
  onTypingDone: () => {
    console.log('Typing done.');
  }
};

// Typewrite.propTypes = {
//   children: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.element,
//     PropTypes.array
//   ]).isRequired,
//   cycle: PropTypes.bool,
//   eraseDelay: PropTypes.number,
//   startTypingDelay: PropTypes.number,
//   cycleType: PropTypes.oneOf(['erase', 'reset']),
//   pause: PropTypes.bool,
//   className: PropTypes.string,
//   onTypingDone: PropTypes.func,
//   defaultElement: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
//   typingDelay: PropTypes.number,
//   hideCursorDelay: PropTypes.number,
//   cursorColor: PropTypes.string,
//   cursorWidth: PropTypes.number
// };

export default Typewrite;
