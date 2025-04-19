// ErrorScreen.jsx
export default function ErrorScreen({ message = "May error again sa work mong tanga ka" }) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center">
        <div>{message}</div>
      </div>
    );
  }