import './modal.css';

function Modal({ children, style }) {
  return (
    <div className="modal" style= {{...style}}>
      {children}
    </div>
  );
}

export default Modal;
