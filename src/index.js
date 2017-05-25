import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.resetInitialization();
    this.state = {
      toRender: <span key="0" className="tw">{props.defaultText}</span>
    };
  }

  componentWillMount() {
    this.injectStyles();
  }

  componentDidMount() {
    const {
      children,
      pause,
      cycle,
      hideCursorDelay,
      onTypingDone
    } = this.props;

    if (cycle) {
      const self = this, childrenArr = React.Children.toArray(children);
      (function loopChildren(index) {
        console.log('index=', index, childrenArr[index]);
        self.setVDOMRootTree(childrenArr[index]);
        self.calculateCharacterCount(self.root);
        self.setNextTargetCharacterIndex();
        self.tree = self.buildTree(self.root);
        new Promise(resolve => {
          if (childrenArr[index] === ' ') {
            resolve();
          } else {
            self.startTyping(resolve);
          }
        }).then(() => {
          if (index < childrenArr.length - 1) {
            self.resetInitialization();
            loopChildren(index + 1);
          } else {
            hideCursorDelay > -1 && self.hideCursor();
            onTypingDone();
          }
        });
      })(0);
    } else {
      // Set the VDOM tree root
      this.setVDOMRootTree(children);

      // Calculate and store character and word counts
      this.calculateCharacterCount(this.root);

      // Set pointer to next target character
      this.setNextTargetCharacterIndex();

      this.tree = this.buildTree(this.root);
      if (!pause) {
        new Promise((resolve, reject) => {
          this.startTyping(resolve, reject);
        }).then(() => {
          hideCursorDelay > -1 && this.hideCursor();
          onTypingDone();
        });
      }
    }
  }

  componentDidUpdate(prevProps) {
    // const { pause, hideCursorDelay, onTypingDone } = this.props;
    // if (prevProps.pause !== pause && !pause) {
    //   new Promise((resolve, reject) => {
    //     this.startTyping(resolve, reject);
    //   }).then(() => {
    //     hideCursorDelay > -1 && this.hideCursor();
    //     onTypingDone();
    //   });
    // }
  }
  
  resetInitialization() {
    this.key = 0; // Assign a unique key to each element inside arrays
    this.totalCharCount = 0; // Total number of characters
    this.totalWordCount = []; // Number of characters for each word
    this.currentCharIndex = 0; // Points to the current character index
    this.targetCharIndex = 0; // Points to the targeted character index
    this.startTypingAtIndex = 0;
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
  setNextTargetCharacterIndex() {
    const { wordByWord } = this.props, lastInd = this.totalWordCount.length - 1;

    if (!wordByWord) {
      this.targetCharIndex++;
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
    return (
      Math.floor(Math.random() * (maxTypingDelay - minTypingDelay + 1)) +
      minTypingDelay
    );
  }

  // Start typing characters
  startTyping(mainResolve, mainReject) {
    const self = this;
    (function type() {
      const charIndex = self.getTargetCharacterIndex();
      if (charIndex > self.getTotalCharacterCount()) {
        mainResolve();
      } else {
        const delay = self.getDelay();
        self.currentCharIndex = 0;
        new Promise((resolve, reject) => {
          const newTree = self.duplicateTree(self.tree);
          const toRender = self.generateRenderTree(newTree);
          setTimeout(() => {
            self.setState({ toRender });
            resolve();
          }, delay);
        }).then(type);
      }
      self.setNextTargetCharacterIndex();
    })();
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

    if (currentIndex >= targetIndex) return null;

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
    const style = document.createElement('style');
    style.innerHTML = `.tw>*{display:inline}.tw:after{position:relative;content:" ";top:-2px;border:1px solid;margin-left:3px;-webkit-animation:1s blink step-end infinite;-moz-animation:1s blink step-end infinite;-ms-animation:1s blink step-end infinite;-o-animation:1s blink step-end infinite;animation:1s blink step-end infinite}@keyframes blink{from,to{color:transparent}50%{color:#000}}@-moz-keyframes blink{from,to{color:transparent}50%{color:#000}}@-webkit-keyframes blink{from,to{color:transparent}50%{color:#000}}@-ms-keyframes "blink"{from,to{color:transparent}50%{color:#000}}@-o-keyframes blink{from,to{color:transparent}50%{color:#000}}.tw.tw-done:after{opacity:0}`;
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
  pause: false,
  defaultText: '',
  wordByWord: false,
  minTypingDelay: 100,
  maxTypingDelay: 200,
  hideCursorDelay: -1,
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
  pause: PropTypes.bool,
  wordByWord: PropTypes.bool,
  className: PropTypes.string,
  onTypingDone: PropTypes.func,
  defaultText: PropTypes.string,
  minTypingDelay: PropTypes.number,
  maxTypingDelay: PropTypes.number,
  hideCursorDelay: PropTypes.number
};

export default Typewrite;
