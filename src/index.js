import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textToRender: '',
    }
    this.characterPtr = 0;
    this.stringPtr = 0;
    this.textArr = [];
  }

  componentWillMount() {
    this.injectStyles();
  }

  componentDidMount() {
    const {children, pause} = this.props;
    this.parseChildren(children);
    if (this.textArr.length > 0 && !pause) {
      this.animateTyping();
    }
    console.log('this.textArr', this.textArr);
  }

  componentDidUpdate(prevProps) {
    const {pause} = this.props;
    if ((prevProps.pause !== pause) && !pause) {
      this.animateTyping();
    }
  }

  parseChildren(children) {
    if (typeof(children) === 'string') {
      this.appendText('string', children);
    } else if (Array.isArray(children)) {
      React.Children.forEach(children, function(element) {
        if (typeof(element) === 'string') {
          this.appendText('string', element);
        } else if (React.isValidElement(element)) {
          this.appendText(
            <element.type {...element.props}>{''}</element.type>,
            element.props.children
          );
        }
      }.bind(this));
    }
  }

  appendText(element, text) {
    this.textArr.push({element, text});
  }

  injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .typewrite > * {
        display: inline;
      }
      .typewrite::after {
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
      }`;
    document.head.appendChild(style);
  }

  animateTyping() {
    const {textToRender} = this.state,
          {minTypingDelay, maxTypingDelay} = this.props,
          textArr = this.textArr,
          stringPtr = this.stringPtr,
          characterPtr = this.characterPtr,
          delay = Math.floor(Math.random() * (maxTypingDelay - minTypingDelay + 1)) + minTypingDelay;
    let newText;

    if (!textArr[stringPtr]) return;

    if (characterPtr < textArr[stringPtr].text.length) {
      if (textArr[stringPtr].element.props) {
        if (textArr[stringPtr].element.props.stamp) {
          newText = `${textToRender}${textArr[stringPtr].text}`;
          this.characterPtr = this.characterPtr + textArr[stringPtr].text.length;
        }
        // if (textArr[stringPtr].element.props.backspace) {
        // }
        else {
          newText = `${textToRender}${textArr[stringPtr].text[characterPtr]}`;
          this.characterPtr++;
        }
      } else {
        newText = `${textToRender}${textArr[stringPtr].text[characterPtr]}`;
        this.characterPtr++;
      }
      this.setState({
        textToRender: newText
      });
      if (this.characterPtr === textArr[stringPtr].text.length) {
        this.stringPtr++;
        this.characterPtr = 0;
        if (textArr[this.stringPtr]) {
          this.setState({
            textToRender: ''
          });
        }
      }
      window.setTimeout(function() {
        this.animateTyping();
      }.bind(this), delay);
    }
  }

  render() {
    let {className} = this.props;
    const toRender = [],
          textArr = this.textArr,
          stringPtr = this.stringPtr;

    className = (className) ? `${className} typewrite` : 'typewrite';
    if ((textArr.length > 0) && textArr[stringPtr]) {
      if (textArr[stringPtr].element === 'string') {
        toRender.push(this.state.textToRender);
      } else {
        const ElementToClone = textArr[stringPtr].element.type;
        const props = textArr[stringPtr].element.props;
        const {stamp, backspace, ...otherProps} = props;
        toRender.push(
          <ElementToClone {...otherProps} key={toRender.length}>
            {this.state.textToRender}
          </ElementToClone>
        );
      }
    }
    return <span className={className}>{toRender}</span>
  }
}

Typewrite.defaultProps = {
  pause: false,
  minTypingDelay: 50,
  maxTypingDelay: 100,
};

Typewrite.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.array
  ]).isRequired,
  className: PropTypes.string,
  pause: PropTypes.bool,
  minTypingDelay: PropTypes.number,
  maxTypingDelay: PropTypes.number,
};

export default Typewrite;
