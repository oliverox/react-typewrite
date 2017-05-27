import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.initializeTyping();
    this.state = {
      toRender: <span key="0" className="tw">{props.defaultElement}</span>
    };
  }

  componentWillMount() {
    this.injectStyles();
  }

  componentDidMount() {
    if (!this.props.pause) {
      this.typeWrite();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pause !== this.props.pause && !this.props.pause) {
      this.typeWrite();
    }
  }

  initializeTyping() {
    this.key = 0; // Assign a unique key to each element inside arrays
    this.totalCharCount = 0; // Total number of characters
    this.totalWordCount = []; // Number of characters for each word
    this.currentCharIndex = 0; // Points to the current character index
    this.targetCharIndex = 0; // Points to the targeted character index
    this.targetCharIndexBeforeErase = 0; // Store the target character index before erasing word
  }

  typeWrite() {
    const { cycle, cycleType, defaultElement, children } = this.props;
    if (cycle) {
      const self = this, childrenArr = React.Children.toArray(children);
      if (defaultElement !== '') {
        childrenArr.unshift(defaultElement);
      }
      (function loopChildren(index) {
        // Setup tree
        self.prepareElementsForTyping(childrenArr[index]);

        // Start typing animation for current child
        new Promise(resolve => {
          if (childrenArr[index] === ' ') {
            resolve();
          } else {
            self.beginTyping(resolve, false);
          }
        }).then(() => {
          new Promise(resolve => {
            if (cycleType === 'erase' && index < childrenArr.length - 1) {
              self.targetCharIndexBeforeErase = self.targetCharIndex;
              self.beginTyping(resolve, true);
            } else {
              resolve();
            }
          }).then(() => {
            if (index < childrenArr.length - 1) {
              self.initializeTyping();
              loopChildren(index + 1);
            } else {
              self.endTyping();
            }
          });
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
    this.setVDOMRootTree(children);

    // Calculate and store character and word counts
    this.calculateCharacterCount(this.root);

    // Set pointer to next target character
    this.setNextTargetCharacterIndex();

    // Build tree from root element
    this.tree = this.buildTree(this.root);
  }

  setVDOMRootTree(childrenArr) {
    const { className } = this.props;
    this.root = (
      <span key="0" className={className ? `${className} tw` : `tw`}>
        {React.Children.toArray(childrenArr)}
      </span>
    );
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
  setNextTargetCharacterIndex(erasing = false) {
    const { wordByWord } = this.props, lastInd = this.totalWordCount.length - 1;

    if (!wordByWord) {
      erasing ? this.targetCharIndex-- : this.targetCharIndex++;
    } else {
      if (this.totalWordCount[lastInd] <= this.currentCharIndex) {
        this.targetCharIndex = this.totalCharCount;
      } else {
        for (const wordLength of this.totalWordCount) {
          if (wordLength > this.currentCharIndex) {
            this.targetCharIndex = wordLength;
            break;
          }
        }
      }
      if (this.currentCharIndex === this.totalCharCount) {
        this.targetCharIndex++;
      }
    }
  }

  // Calculate total characters and words
  calculateCharacterCount(el, charCount = 0) {
    const self = this;
    let match, re;
    if (el === ' ') {
      charCount++;
    } else {
      React.Children.forEach(el.props.children, child => {
        if (typeof child === 'string') {
          re = /\s/g;
          match = re.exec(child);
          while (match !== null) {
            self.totalWordCount.push(charCount + match.index + 1);
            match = re.exec(child);
          }
          charCount += child.length;
        } else {
          charCount = self.calculateCharacterCount(child, charCount);
        }
      });
    }
    this.totalCharCount = charCount;
    return charCount;
  }

  // Returns a random delay
  getDelay() {
    const { maxTypingDelay, minTypingDelay } = this.props;
    const maxMinusMin = Math.abs(maxTypingDelay - minTypingDelay);
    return Math.floor(Math.random() * (maxMinusMin + 1)) + minTypingDelay;
  }

  // Start typing characters
  beginTyping(mainResolve, erasing = false) {
    const self = this, { cycleDelay } = this.props;
    function type() {
      const charIndex = self.getTargetCharacterIndex();
      if (
        (!erasing && charIndex > self.getTotalCharacterCount()) ||
        (erasing && charIndex < 0)
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
            resolve();
          }, delay);
        }).then(type);
      }
      self.setNextTargetCharacterIndex(erasing);
      if (self.targetCharIndex < 0) {
        erasing = false;
        self.targetCharIndex = self.targetCharIndexBeforeErase + 1;
      }
    };
    if (erasing && cycleDelay > 0) {
      setTimeout(() => {
        type();
      }, cycleDelay)
    } else {
      type();
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
      currentIndex = self.currentCharIndex,
      targetIndex = self.getTargetCharacterIndex();

    if (tree.el === 'string') {
      if (currentIndex + tree.children.length < targetIndex) {
        self.currentCharIndex += tree.children.length;
        return tree;
      } else {
        self.currentCharIndex = targetIndex;
        return {
          el: tree.el,
          children: tree.children.slice(0, targetIndex - currentIndex)
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
    const style = document.createElement('style'), { cursorColor, cursorWidth } = this.props;
    style.innerHTML = `.tw>*{display:inline}.tw:after{position:relative;content:" ";top:1px;border-right:0;border-left:${cursorWidth} solid;margin-left:3px;-webkit-animation:1s blink step-end infinite;-moz-animation:1s blink step-end infinite;-ms-animation:1s blink step-end infinite;-o-animation:1s blink step-end infinite;animation:1s blink step-end infinite}@keyframes blink{from,to{color:transparent}50%{color:${cursorColor}}}@-moz-keyframes blink{from,to{color:transparent}50%{color:${cursorColor}}}@-webkit-keyframes blink{from,to{color:transparent}50%{color:${cursorColor}}}@-ms-keyframes "blink"{from,to{color:transparent}50%{color:${cursorColor}}}@-o-keyframes blink{from,to{color:transparent}50%{color:${cursorColor}}}.tw.tw-done:after{opacity:0}`;
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
  cycleDelay: 800,
  cycleType: 'erase',
  pause: false,
  defaultElement: '',
  wordByWord: false,
  minTypingDelay: 30,
  maxTypingDelay: 30,
  hideCursorDelay: -1,
  cursorColor: '#000',
  cursorWidth: '2px',
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
  cycleDelay: PropTypes.number,
  cycleType: PropTypes.oneOf(['erase', 'reset']),
  pause: PropTypes.bool,
  wordByWord: PropTypes.bool,
  className: PropTypes.string,
  onTypingDone: PropTypes.func,
  defaultElement: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  minTypingDelay: PropTypes.number,
  maxTypingDelay: PropTypes.number,
  hideCursorDelay: PropTypes.number,
  cursorColor: PropTypes.string,
  cursorWidth: PropTypes.string
};

export default Typewrite;
