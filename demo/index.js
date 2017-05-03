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
        <h1>Following text will be typed.</h1><DemoComponent htmlTag="h1">Hello there!</DemoComponent>
      </div>
    );
  }
}

ReactDOM.render(
  <Demo />,
  document.getElementById('root')
);
