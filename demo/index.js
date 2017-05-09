import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TypeWrite from '../src/index';
import logo from './logo.svg';
import './demo.css';

class Demo extends Component {
  constructor() {
    super()
    this.state = {
      pause: true
    }
  }

  componentDidMount() {
    // For sake of this demo, start typing animation after 2s
    window.setTimeout(function() {
      console.log('will now unpause');
      this.setState({
        pause: false
      });
    }.bind(this), 2000);
  }

  render() {
    const {pause} = this.state;
    return (
      <div className="demo">
        <div className="demo-header">
          <img src={logo} className="demo-logo" alt="logo" />
          <span className="demo-title">Component Demo</span>
        </div>
        <div><TypeWrite pause={pause}>Oliver <strong>Oxenham</strong> was here.</TypeWrite></div>
        <div><TypeWrite><p>Andre-Maurice <strong><span style={{color: 'red'}}>Oxenham</span></strong></p></TypeWrite></div>
        {/* <div>
          <TypeWrite>This is a simple string</TypeWrite>
          <h3 style={{color: 'orange'}}>
            <TypeWrite pause={pause}>
              <span backspace={0}>Lorem ipsum</span>
              <span stamp style={{color: 'hotpink'}}>Lorem ipsum dolor blah blah</span>
            </TypeWrite>
          </h3>
        </div> */}
        {/* <div>
          <TypeWrite><p>Lorem ipsum dolor sit amet, <strong>consectetur adipisicing elit</strong>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></TypeWrite>
        </div> */}
        {/* <div>
          <TypeWrite pause={pause}>
            <div>Hello there!</div>
            <p style={{color: 'blue'}}>How are you?</p>
          </TypeWrite>
        </div> */}
      </div>
    );
  }
}

ReactDOM.render(
  <Demo />,
  document.getElementById('root')
);
