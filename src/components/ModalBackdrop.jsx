export function ModalBackdrop({
  isOpen,
  className,
  onClose,
  children,
  ...accessibilityProps
}) {
  return (
    <div
      className={`${className}${isOpen ? "" : " hidden"}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      {...accessibilityProps}
    >
      {children}
    </div>
  );
}
