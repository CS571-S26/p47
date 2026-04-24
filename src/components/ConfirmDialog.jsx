import { Modal, Button } from 'react-bootstrap'

/**
 * In-app confirm dialog. Prefer this over window.confirm on mobile/PWA where
 * native dialogs are suppressed outside a user gesture or in some WebViews.
 */
export function ConfirmDialog({
  show,
  onHide,
  title,
  children,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'danger',
}) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard>
      <Modal.Header closeButton>
        <Modal.Title as="h2" style={{ fontSize: '1.15rem' }}>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

/** Single-action dialog to replace window.alert on mobile. */
export function MessageDialog({
  show,
  onHide,
  title = 'Notice',
  children,
  buttonLabel = 'OK',
}) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard>
      <Modal.Header closeButton>
        <Modal.Title as="h2" style={{ fontSize: '1.15rem' }}>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>
          {buttonLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
