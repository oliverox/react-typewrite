import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import DemoComponent from '../src/index';
import logo from './logo.svg';
import './demo.css';

class Demo extends Component {
  render() {
    return (
      <div className="demo">
        <div className="demo-header">
          <img src={logo} className="demo-logo" alt="logo" />
          <span className="demo-title">Component Demo</span>
        </div>
        <h2>Following text will be typed. <DemoComponent className="typewrite">Hello there! What's going on today?</DemoComponent></h2>
      </div>
    );
  }
}

ReactDOM.render(
  <Demo />,
  document.getElementById('root')
);
