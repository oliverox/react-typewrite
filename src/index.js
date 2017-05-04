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
  }

  componentDidMount() {
    const {children} = this.props;
    this.iterator = function* iterateChar() {
      var index = 0;
      while (index < children.length) {
        yield children[index++];
      }
    }()
    this.getNextCharacter(true);
  }

  getTypingDelay() {
    const {typingDelay} = this.props;
    return Math.floor(
      Math.random() * (
        (typingDelay + TYPING_DELAY_INTERVAL) - (typingDelay - TYPING_DELAY_INTERVAL)
      )) + (typingDelay - TYPING_DELAY_INTERVAL);
  }

  getNextCharacter(onMount) {
    const delay = (onMount) ? this.props.initialDelay : this.getTypingDelay();
    window.setTimeout(function() {
      const next = this.iterator.next();
      if (!next.done) {
        this.appendCharacter(next.value);
        this.getNextCharacter(false);
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
    const {htmlTag, initialDelay, typingDelay, children, ...rest} = this.props;
    const Tag = htmlTag;
    return(
      <Tag {...rest}>
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
  initialDelay: 300,
  typingDelay: 65,
};

Typewrite.propTypes = {
  htmlTag: PropTypes.oneOf([
    'span', 'p', 'div',
    'h1', 'h2', 'h3',
    'h4', 'h5', 'h6'
  ]),
  className: PropTypes.string,
  children: PropTypes.string.isRequired,
  initialDelay: PropTypes.number,
  typingDelay: PropTypes.number,
};

export default Typewrite;
