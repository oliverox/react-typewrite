import React, {Component} from 'react';
import PropTypes from 'prop-types';

const styles = {
  color: 'hotpink',
}

class Typewrite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    }
  }

  componentDidMount() {
    const {initialDelay, typingDelay, children} = this.props;
    let delay = initialDelay;

    const animate = (char) => {
      return function() {
        this.appendCharacter(char);
      }.bind(this)
    }

    for (let char of children) {
      console.log('character:', char);
      window.setTimeout(animate(char), delay);
      delay = typingDelay;
    }
  }

  appendCharacter(char) {
    const currentText = this.state.text;
    this.setState({
      text: `${currentText}${char}`
    });
    this.forceUpdate();
  }

  render() {
    const {htmlTag, initialDelay, typingDelay, children, ...rest} = this.props;
    const Tag = htmlTag;
    return(
      <Tag style={styles} {...rest}>
        {this.state.text}<div style={{
          display: 'inline',
          border: '1px solid',
          marginLeft: 1
        }}></div>
      </Tag>
    );
  }
}

Typewrite.defaultProps = {
  htmlTag: 'span',
  initialDelay: 300,
  typingDelay: 2000,
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
