import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2 style={{ color: "red" }}>⚠ Something went wrong in TimelineCodePlayer</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
