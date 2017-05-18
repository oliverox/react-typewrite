import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toRender: <span key="0" className="typewrite"></span>,
      typingDone: false,
    }
    this.key = 0;
    this.totalCharacterLength = 0;
    this.currentCharIndex = 0;
    this.targetCharIndex = 0;
  }

  componentWillMount() {
    this.injectStyles();
  }

  componentDidMount() {
    const {children, className, pause, hideCursorDelay} = this.props;
    this.root = <span key="0" className={(className) ? `${className} typewrite` : 'typewrite'}>{React.Children.toArray(children)}</span>
    this.totalCharacterLength = this.getTotalCharacterLength(this.root, 0);
    this.tree = this.buildTree(this.root);
    const promise = new Promise((resolve, reject) => {
      this.startTyping(resolve, reject);
    }).then(() => {
      console.log('Typing done!');
    })
  }

  componentDidUpdate(prevProps) {
    // const {children, pause, hideCursorDelay} = this.props;
    // if ((prevProps.pause !== pause) && !pause) {
    //   new Promise((resolve, reject) => {
    //     this.typeWrite(children, resolve, reject);
    //   }).then(() => {
    //     console.log('typing done!');
    //     (hideCursorDelay > -1) && this.hideCursor();
    //   });
    // }
  }

  startTyping(mainResolve, mainReject) {
    const {maxTypingDelay, minTypingDelay} = this.props,
          self = this;

    (function type(charIndex) {
      if (charIndex > self.totalCharacterLength) {
        mainResolve();
      } else {
        const delay = Math.floor(Math.random() * (maxTypingDelay - minTypingDelay + 1)) + minTypingDelay;
        self.targetCharIndex = charIndex;
        self.currentCharIndex = 0;
        console.log('targetCharIndex=', self.targetCharIndex);
        new Promise((resolve, reject) => {
          const newTree = self.duplicateTree(self.tree);
          const toRender = self.renderTree(newTree);
          setTimeout(() => {
            console.log('inside timeout', charIndex);
            console.log('newTree', newTree);
            self.setState({toRender});
            resolve();
          }, delay);
        }).then(() => {
          type(charIndex + 1);
        })
      }
    })(1);
  }

  buildTree(el) {
    const self = this;
    if (Array.isArray(el)) {
      return el.map((child) => {
        return self.buildTree(child)
      })
    } else if (typeof(el) === 'string') {
      return {
        el: 'string',
        children: el
      }
    } else if (React.isValidElement(el)) {
      const {children, ...otherProps} = el.props;
      return {
        el: el.type,
        key: this.key++,
        props: otherProps,
        children: self.buildTree(children)
      }
    }
  }

  duplicateTree(tree) {
    const self = this;
    if (self.currentCharIndex >= self.targetCharIndex) return null;

    if (tree.el === 'string') {
      if ((self.currentCharIndex + tree.children.length) < self.targetCharIndex) {
        self.currentCharIndex = self.currentCharIndex + tree.children.length;
        return tree;
      } else {
        const ind = self.targetCharIndex - self.currentCharIndex;
        self.currentCharIndex = self.targetCharIndex;
        return {
          el: tree.el,
          children: tree.children.slice(0, ind)
        }
      }
    } else if (tree.el && tree.el !== 'string') {
      return {
        el: tree.el,
        props: tree.props,
        key: tree.props,
        children: self.duplicateTree(tree.children)
      }
    } else if (Array.isArray(tree)) {
      return (tree.map((child) => {
        return self.duplicateTree(child)
      })).filter((child) => {
        return ((child !== null) && (typeof(child) !== 'undefined'))
      });
    }
  }

  renderTree(tree) {
    const self = this;
    if (tree.el === 'string') {
      return tree.children;
    } else if (Array.isArray(tree)) {
      return tree.map((child) => {
        return self.renderTree(child);
      });
    } else if ((typeof(tree) === 'object') && tree.el) {
      return <tree.el key={tree.key} {...tree.props}>{
        self.renderTree(tree.children)
      }</tree.el>
    } else {
      throw {
        msg: 'Invalid tree',
        value: tree
      };
    }
  }

  getTotalCharacterLength(el, start) {
    const self = this;
    let total = start;
    React.Children.forEach(el.props.children, (child) => {
      if (typeof(child) === 'string') {
        total = total + child.length;
      } else {
        total = self.getTotalCharacterLength(child, total);
      }
    })
    return total;
  }

  injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .typewrite > * {
        display: inline;
      }
      .typewrite:after {
        content: " ";
        border: 1px solid;
        margin-left: 1px;
        -webkit-animation: 1s blink step-end infinite;
        -moz-animation: 1s blink step-end infinite;
        -ms-animation: 1s blink step-end infinite;
        -o-animation: 1s blink step-end infinite;
        animation: 1s blink step-end infinite;
      }
      @keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-moz-keyframes blink {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-webkit-keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-ms-keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }

      @-o-keyframes "blink" {
        from, to {
          color: transparent;
        }
        50% {
          color: black;
        }
      }
      .typewrite.done:after {
        opacity: 0;
      }`;
    document.head.appendChild(style);
  }

  render() {
    return this.state.toRender;
  }
}

Typewrite.defaultProps = {
  pause: false,
  endOfLineDelay: 1000,
  minTypingDelay: 50,
  maxTypingDelay: 80,
  hideCursorDelay: -1,
};

Typewrite.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.array
  ]).isRequired,
  className: PropTypes.string,
  pause: PropTypes.bool,
  endOfLineDelay: PropTypes.number,
  minTypingDelay: PropTypes.number,
  maxTypingDelay: PropTypes.number,
  hideCursorDelay: PropTypes.number,
};

export default Typewrite;
