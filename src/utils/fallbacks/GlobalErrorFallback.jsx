export const GlobalErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div>
      <div>something went wrong: {error.message}</div>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};
