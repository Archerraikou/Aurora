import './modal.css';

function Modal({ children }) {
  return (
    <div className="modal">
      {children}
    </div>
  );
}

export default Modal;
