import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toRender: [],
      doneTyping: false,
    }
    this.toRender = [];
    this.characterPtr = 0;
  }

  componentWillMount() {
    this.injectStyles();
  }

  componentDidMount() {
    const {children, pause} = this.props;
    if (pause === false) {
      new Promise((resolve, reject) => {
        this.typeWrite(children, resolve, reject);
      }).then(() => {
        console.log('typing done!');
        this.setState({
          doneTyping: true
        });
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {children, pause} = this.props;
    if ((prevProps.pause !== pause) && !pause) {
      new Promise((resolve, reject) => {
        this.typeWrite(children, resolve, reject);
      }).then(() => {
        console.log('typing done!');
        this.setState({
          doneTyping: true
        });
      });
    }
  }

  delay() {
    const {maxTypingDelay, minTypingDelay} = this.props;
    return Math.floor(Math.random() * (maxTypingDelay - minTypingDelay + 1)) + minTypingDelay;
  }

  typeWrite(el, resolve, reject) {
    // debugger;
    if (Array.isArray(el)) {
      const self = this;
      const mainResolve = resolve;
      (function each(index) {
        const promise = new Promise((resolve, reject) => {
          console.log('each: index', index);
          // debugger;
          if (index >= el.length) {
            return mainResolve();
          }
          self.characterPtr = 0;
          self.typeWrite(el[index], resolve, reject)
        }).then(() => (index < el.length && each(index + 1)));
      })(0);
    }
    else if (React.isValidElement(el)) {
      this.toRender.push(<el.type key={this.toRender.length} {...el.props}>{''}</el.type>);
      if (typeof(el.props.children) === 'string') {
        this.animateTyping(el.props.children, resolve, reject);
      } else {
        this.typeWrite(el.props.children, resolve, reject);
      }
    }
    else if (typeof(el) === 'string') {
      this.toRender.push('');
      this.animateTyping(el, resolve, reject);
    }
  }

  animateTyping(text, mainResolve, mainReject) {
    const last = this.toRender.length - 1;
    const element = this.toRender[last];

    if (React.isValidElement(element)) {
      const promise = new Promise((resolve, reject) => {
        setTimeout(function() {
          this.toRender[last] = React.cloneElement(
            element,
            {},
            element.props.children.concat(text[this.characterPtr])
          );
          this.updateState();
          this.characterPtr++;
          resolve();
        }.bind(this), this.delay());
      }).then(function() {
        if (this.characterPtr < text.length) {
          this.animateTyping(text, mainResolve, mainReject);
        } else {
          this.characterPtr = 0;
          mainResolve();
        }
      }.bind(this))
    }
    else if (typeof(element) === 'string') {
      const promise = new Promise((resolve, reject) => {
        setTimeout(function() {
          this.toRender[last] = this.toRender[last].concat(text[this.characterPtr]);
          this.updateState();
          this.characterPtr++;
          resolve();
        }.bind(this), this.delay());
      }).then(() => {
        if (this.characterPtr < text.length) {
          this.animateTyping(text, mainResolve, mainReject);
        } else {
          mainResolve();
        }
      });
    }
  }

  updateState() {
    this.setState({
      toRender: this.toRender
    });
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
    let {className} = this.props;
    const {doneTyping} = this.state;
    className = (className) ? `${className} typewrite` : 'typewrite';
    className = (doneTyping) ? `${className} done` : className;
    return <span className={className}>{this.state.toRender}</span>
  }
}

Typewrite.defaultProps = {
  pause: false,
  endOfLineDelay: 1000,
  minTypingDelay: 50,
  maxTypingDelay: 80,
  hideCursorOnDone: true,
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
  hideCursorOnDone: PropTypes.bool,
};

export default Typewrite;
