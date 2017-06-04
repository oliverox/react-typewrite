import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
    this.mode = 1; // 1 => typing, -1 => erasing
  }

  async start() {
    const { cycle, cycleType, defaultElement, children } = this.props,
      childrenArr = React.Children.toArray(children),
      childrenArrLength = childrenArr.length;
      
    if (defaultElement !== '') {
      childrenArr.unshift(defaultElement);
      this.currentCharIndex = this.calculateCharacterCount(defaultElement);
      this.targetCharIndex = this.currentCharIndex;
      this.mode = -1;
    }

    const loopChildren = index => {
      const child = childrenArr[index];
      // Setup tree
      this.prepareElementsForTyping(child);

      // Start typing animation for current child
      return new Promise(resolve => {
        if (child === ' ') {
          resolve();
        } else {
          this.typeWrite(resolve);
        }
      });
    };
    
    if (!cycle) {
      this.prepareElementsForTyping(childrenArr);
    
      // Start typing animation
      new Promise(resolve => {
        this.typeWrite(resolve);
      }).then(() => {
        this.end();
      });
    } else {
      let index = 0;
      while (index <= childrenArrLength) {
        // debugger;
        await loopChildren(index);
        if (cycleType === 'erase') {
          this.mode = -this.mode;
          if (this.mode > 0) {
            debugger;
            this.resetCounters();
            index++;
          } else {
            if (index === childrenArrLength) {
              // Force out of while loop so as not to erase last word
              index++;
            }
          }
        } else {
          index++;
        }
      }
      this.end();
    }
    // } else {
    //   // Setup tree
    //   this.prepareElementsForTyping(children);
    // 
    //   // Start typing animation
    //   new Promise(resolve => {
    //     this.typeWrite(resolve);
    //   }).then(() => {
    //     this.end();
    //   });
    // }
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
    this.mode < 0 ? this.targetCharIndex-- : this.targetCharIndex++;
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

  renderNextCharacter() {
    const self = this;
    this.currentCharIndex = 0;
    return new Promise(resolve => {
      const newTree = self.duplicateTree(self.tree),
        toRender = self.generateRenderTree(newTree);
      setTimeout(() => {
        self.setState({ toRender });
        self.setNextTargetCharacterIndex();
        resolve();
      }, self.getDelay());
    });
  }

  characterTyped(mainResolve) {
    const targetCharIndex = this.getTargetCharacterIndex(),
      totalCharCount = this.getTotalCharacterCount();
    return () => {
      if (
        (this.mode > 0 && targetCharIndex > totalCharCount) ||
        (this.mode < 0 && targetCharIndex <= 0)
      ) {
        return mainResolve();
      } else {
        this.typeWrite(mainResolve);
      }
    };
  }

  typeWrite(mainResolve) {
    const self = this,
      { eraseDelay, startTypingDelay } = this.props;

    if (this.mode < 0) {
      if (eraseDelay > 0) {
        setTimeout(() => {
          self.renderNextCharacter().then(self.characterTyped(mainResolve));
        }, eraseDelay);
      } else {
        self.renderNextCharacter().then(self.characterTyped(mainResolve));
      }
    } else {
      if (startTypingDelay > 0) {
        setTimeout(() => {
          self.renderNextCharacter().then(self.characterTyped(mainResolve));
        }, startTypingDelay);
      } else {
        self.renderNextCharacter().then(self.characterTyped(mainResolve));
      }
    }
  }

  end() {
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
      cn = this.uniqueClassName,
      { cursorColor, cursorWidth } = this.props;
    style.innerHTML = `.${cn}>*{display:inline}.${cn}:after{position:relative;content:" ";top:-1px;border-right:0;
      border-left:${cursorWidth}px solid;margin-left:5px;-webkit-animation:1s blink-${cn} step-end infinite;-moz-animation:1s blink-${cn} step-end infinite;-ms-animation:1s blink-${cn} step-end infinite;-o-animation:1s blink-${cn} step-end infinite;animation:1s blink-${cn} step-end infinite}@keyframes blink-${cn}{from,to{color:transparent}50%{color:${cursorColor}}}@-moz-keyframes blink-${cn}{from,to{color:transparent}50%{color:${cursorColor}}}@-webkit-keyframes blink-${cn}{from,to{color:transparent}50%{color:${cursorColor}}}@-ms-keyframes "blink-${cn}"{from,to{color:transparent}50%{color:${cursorColor}}}@-o-keyframes blink-${cn}{from,to{color:transparent}50%{color:${cursorColor}}}.${cn}.tw-done:after{opacity:0}`;
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
