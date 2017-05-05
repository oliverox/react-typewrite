import React, {Component} from 'react';
import PropTypes from 'prop-types';

const TYPING_DELAY_INTERVAL = 80;

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      typingDone: false,
    }
    this.deleteQueue = [];
    this.currentIndex = 0;
  }

  componentDidMount() {
    const {children, startTyping} = this.props;
    this.iterator = function* iterateChar() {
      var index = 0;
      while (index < children.length) {
        yield children[index++];
      }
    }()
    if (startTyping) {
      this.typeCharacter(true);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.startTyping !== this.props.startTyping) {
      this.typeCharacter();
    }
  }

  getTypingDelay() {
    const {averageTypingDelay} = this.props;
    return Math.floor(
      Math.random() * (
        (averageTypingDelay + TYPING_DELAY_INTERVAL)
        - (averageTypingDelay - TYPING_DELAY_INTERVAL)
      )) + (averageTypingDelay - TYPING_DELAY_INTERVAL);
  }

  getNextCharacter() {
    // Return deleted characters before digging into the iterator stack
    if (this.deleteQueue.length > 0) {
      return {
        value: this.deleteQueue.splice(-1),
        done: false
      }
    } else {
      return this.iterator.next();
    }
  }

  typeCharacter(onMount = false) {
    const delay = (onMount) ? this.props.initialDelay : this.getTypingDelay();
    window.setTimeout(function() {
      const next = this.getNextCharacter();
      if (!next.done) {
        this.appendCharacter(next.value);
        this.typeCharacter();
      } else {
        window.setTimeout(function() {
          this.setState({
            typingDone: true
          });
        }.bind(this), 5000);
      }
    }.bind(this), delay);
  }

  appendCharacter(char) {
    const currentText = this.state.text;
    this.setState({
      text: `${currentText}${char}`
    });
  }

  render() {
    const {htmlTag, className} = this.props, Tag = htmlTag;
    return(
      <Tag className={className}>
        <style dangerouslySetInnerHTML={{
          __html:`
            @keyframes blinker {
              50% { opacity: 0; }
            }
            .typewrite-cursor {
              display: inline;
              border: 1px solid;
              margin-left: 3px;
              animation: blinker 1s ease-out infinite;
            }`
        }} />
        {this.state.text}
        <div className="typewrite-cursor" style={{
          opacity: (this.state.typingDone) ? 0 : 1
        }}></div>
      </Tag>
    );
  }
}

Typewrite.defaultProps = {
  htmlTag: 'span',
  startTyping: true,
  initialDelay: 300,
  averageTypingDelay: 80,
};

Typewrite.propTypes = {
  htmlTag: PropTypes.oneOf([
    'span', 'p', 'div',
    'h1', 'h2', 'h3',
    'h4', 'h5', 'h6'
  ]),
  averageTypingDelay: PropTypes.number,
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
  initialDelay: PropTypes.number,
  startTyping: PropTypes.bool,
};

export default Typewrite;
