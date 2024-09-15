import { h, Component } from 'preact';
import { JSX } from 'preact/jsx-runtime';

class MyComponent extends Component {
  render(): JSX.Element {
    return (
      <div>
        <h1>Hello, Preact!</h1>
      </div>
    );
  }
}

export default MyComponent;
