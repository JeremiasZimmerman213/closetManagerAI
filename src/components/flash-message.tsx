interface FlashMessageProps {
  error?: string;
  message?: string;
}

export function FlashMessage({ error, message }: FlashMessageProps) {
  return (
    <>
      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}
    </>
  );
}
