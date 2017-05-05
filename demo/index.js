import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TypeWrite from '../src/index';
import logo from './logo.svg';
import './demo.css';

class Demo extends Component {
  constructor() {
    super()
    this.state = {
      startTyping: false
    }
  }

  componentDidMount() {
    // Start typing animation after 2s
    window.setTimeout(function() {
      this.setState({
        startTyping: true
      });
    }.bind(this), 2000);
  }

  render() {
    const {startTyping} = this.state;
    return (
      <div className="demo">
        <div className="demo-header">
          <img src={logo} className="demo-logo" alt="logo" />
          <span className="demo-title">Component Demo</span>
        </div>
        <h3>
          Following text will be typed:&nbsp;
          <TypeWrite startTyping={startTyping} className="typewrite">
            Hello there! What's going on today?
          </TypeWrite>
        </h3>
      </div>
    );
  }
}

ReactDOM.render(
  <Demo />,
  document.getElementById('root')
);
