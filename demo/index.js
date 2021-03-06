import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import TypeWrite from '../src/index';
import logo from './logo.svg';
import './demo.css';

class Demo extends Component {
  constructor() {
    super();
    this.state = {
      pause1: true,
      pause2: true,
      pause3: true,
      pause4: true,
      pause5: true
    };
  }

  componentDidMount() {
    // For sake of this demo
    new Promise((resolve, reject) => {
      window.setTimeout(
        function() {
          this.setState({
            pause1: false
          });
          resolve();
        }.bind(this),
        2000
      );
    }).then(() => {
      new Promise((resolve, reject) => {
        window.setTimeout(
          function() {
            this.setState({
              pause2: false
            });
            resolve();
          }.bind(this),
          1000
        );
      }).then(() => {
        new Promise((resolve, reject) => {
          window.setTimeout(
            function() {
              this.setState({
                pause3: false
              });
              resolve();
            }.bind(this),
            1000
          );
        }).then(() => {
          new Promise((resolve, reject) => {
            window.setTimeout(
              function() {
                this.setState({
                  pause4: false
                });
                resolve();
              }.bind(this),
              1000
            );
          }).then(() => {
            window.setTimeout(
              function() {
                this.setState({
                  pause5: false
                });
              }.bind(this),
              1000
            );
          });
        });
      });
    });
  }

  render() {
    const { pause1, pause2, pause3, pause4, pause5 } = this.state;
    return (
      <div className="demo">
        <div className="demo-header">
          <img src={logo} className="demo-logo" alt="logo" />
          <span className="demo-title">Component Demo</span>
        </div>

        {/* <div style={{ marginBottom: 10, marginTop: 50 }}>
          <TypeWrite
            cycle
            cycleType="erase"
            pause={pause1}
            hideCursorDelay={2500}
          >
            Oliver
            {' '}
            <span style={{ color: 'yellowgreen' }}>
              <strong>Oxenham</strong>
            </span>
            {' '}
            was here.
          </TypeWrite>
        </div> */}

        <div style={{ marginBottom: 10, marginTop: 50 }}>
          <TypeWrite pause={pause1} cursorColor={'#000'}>
            React
            {' '}
            <span style={{ color: 'orange' }}>
              <strong>by Facebook</strong>
            </span>
            {' '}
            was here.
          </TypeWrite>
        </div>

        <div style={{ marginBottom: 10, marginTop: 50 }}>
          <h1 className="npm">
            npm is the package manager for&nbsp;
            <TypeWrite
              cycle
              pause={pause1}
              cursorColor={'#cb3837'}
              cursorWidth={2}
              startTypingDelay={0}
              eraseDelay={1000}
              hideCursorDelay={500}
              minTypingDelay={50}
              maxTypingDelay={50}
              defaultElement={<span className="what-npm-is-for">node.js</span>}
            >
              <span className="what-npm-is-for">mobile</span>
              <span className="what-npm-is-for">angular</span>
              <span className="what-npm-is-for">react</span>
              <span className="what-npm-is-for">bower</span>
              <span className="what-npm-is-for">jquery</span>
              <span className="what-npm-is-for">nodebots</span>
              <span className="what-npm-is-for">gulp</span>
              <span className="what-npm-is-for">grunt</span>
              <span className="what-npm-is-for">cordova</span>
              <span className="what-npm-is-for">docpad</span>
              <span className="what-npm-is-for">tessel</span>
              <span className="what-npm-is-for">javascript.</span>
            </TypeWrite>
          </h1>
        </div>

        {/* <div style={{ marginBottom: 10, marginTop: 50 }}>
          <TypeWrite cycle>
            <span>Word one</span>
            <span>Word two</span>
            <span>Word three</span>
            <span>Word four</span>
          </TypeWrite>
        </div> */}

        {/* <div style={{ marginBottom: 10 }}>
          <TypeWrite wordByWord pause={pause2}>
            <p>
              <a href="/">André-Maurice</a>
              {' '}
              <strong><span style={{ color: 'red' }}>Oxenham</span></strong>
            </p>
          </TypeWrite>
          </div>

          <div style={{ marginBottom: 10 }}>
          <TypeWrite wordByWord pause={pause3}>
            Simple
            {' '}
            <strong>
              string. <span style={{ color: 'green' }}>Booyah! </span>
            </strong>
            Hello there.
          </TypeWrite>
          </div>

          <div style={{ marginBottom: 10 }}>
          <h3 style={{ color: 'orange' }}>
            <TypeWrite wordByWord pause={pause4}>
              <span>Lorem ipsum. </span>
              <span style={{ color: 'hotpink' }}>
                Lorem ipsum dolor sed do eiusmod tempor incididunt.
              </span>
            </TypeWrite>
          </h3>
        </div> */}

        {/* <div style={{ marginBottom: 10, height: 200 }}>
          <TypeWrite
            pause={pause1}
            minTypingDelay={200}
            maxTypingDelay={300}
          >
            <p>Lorem ipsum dolor sit amet, <strong>consectetur adipisicing elit</strong>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </TypeWrite>
        </div> */}

        {/*<div>
          <TypeWrite pause={pause5}>
            <div>Hello there! </div>
            <p style={{ color: 'blue' }}>How are you?</p>
          </TypeWrite>
        </div> */}

      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'));
