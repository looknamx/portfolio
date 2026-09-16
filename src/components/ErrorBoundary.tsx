import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="container section">
        <h1>Something went wrong.</h1>
        <p>Please reload the page to try again.</p>
        <button className="button primary" onClick={() => location.reload()}>
          Reload page
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
