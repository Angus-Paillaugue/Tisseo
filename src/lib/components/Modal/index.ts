import ModalComponent from './Modal.svelte';
import Backdrop from './Backdrop.svelte';
import Heading from './Heading.svelte';

export const TRANSITION_DURATION = 400;

const Modal = ModalComponent as typeof ModalComponent & {
	Backdrop: typeof Backdrop;
	Heading: typeof Heading;
};
Modal.Backdrop = Backdrop;
Modal.Heading = Heading;

export default Modal;
