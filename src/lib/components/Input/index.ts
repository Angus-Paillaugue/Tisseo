import InputComponent from './Input.svelte';
import FloatingInput from './Floating.svelte';
import TextareaInput from './Textarea.svelte';

const Input = InputComponent as typeof InputComponent & {
	Floating: typeof FloatingInput;
	Textarea: typeof TextareaInput;
};
Input.Floating = FloatingInput;
Input.Textarea = TextareaInput;

export default Input;
