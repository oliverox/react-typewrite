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
    const {initialDelay, children} = this.props;
    window.setTimeout(function() {
      this.setState({
        text: `${children[0]}`
      })
    }.bind(this), initialDelay);
  }
  
  render() {
    const {htmlTag, initialDelay, children, ...rest} = this.props;
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
  initialDelay: 300
};

Typewrite.propTypes = {
  htmlTag: PropTypes.oneOf([
    'span', 'p', 'div', 
    'h1', 'h2', 'h3', 
    'h4', 'h5', 'h6'
  ]),
  className: PropTypes.string,
  children: PropTypes.string.isRequired,
  initialDelay: PropTypes.number
};

export default Typewrite;
