// ErrorScreen.jsx
export default function ErrorScreen({ message = "An error occurred" }) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center">
        <div>{message}</div>
      </div>
    );
  }