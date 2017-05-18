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

        {/* <div style={{marginBottom: 10}}>
          <div><code>&#x3C;TypeWrite pause={pause}&#x3E;Oliver &#x3C;strong&#x3E;Oxenham&#x3C;/strong&#x3E; was here.&#x3C;/TypeWrite&#x3E;</code></div>
          <TypeWrite pause={pause}>Oliver <strong>Oxenham</strong> was here.</TypeWrite>
        </div> */}

        {/* <div style={{marginBottom: 10}}>
          <div><code>&#x3C;TypeWrite&#x3E;&#x3C;p&#x3E;Andre-Maurice &#x3C;strong&#x3E;&#x3C;span style="color: red"&#x3E;Oxenham&#x3C;/span&#x3E;&#x3C;/strong&#x3E;&#x3C;/p&#x3E;&#x3C;/TypeWrite&#x3E;</code></div>
          <TypeWrite><p>Andre-Maurice <strong><span style={{color: 'red'}}>Oxenham</span></strong></p></TypeWrite>
        </div> */}

        <div style={{marginBottom: 10}}>
          <TypeWrite>Simple <strong>string. <span style={{color: 'green'}}>Booyah! </span></strong>Hello there.</TypeWrite>
        </div>

        {/* <div style={{marginBottom: 10}}>
          <h3 style={{color: 'orange'}}>
            <TypeWrite pause={pause}>
              <span backspace={0}>Lorem ipsum</span>
              <span stamp style={{color: 'hotpink'}}>Lorem ipsum dolor blah blah</span>
            </TypeWrite>
          </h3>
        </div> */}

        {/* <div style={{marginBottom: 10, height: 200}}>
          <TypeWrite>
            <p>Lorem ipsum dolor sit amet, <strong>consectetur adipisicing elit</strong>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </TypeWrite>
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
