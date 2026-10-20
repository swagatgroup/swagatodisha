// Uppercase free-text inputs as the user types (the backend stores them uppercase too).
// Only plain text inputs and textareas; emails, passwords, URLs, codes, search boxes and
// anything inside an element with [data-no-uppercase] are left as typed.

const SKIP = /email|password|url|link|website|token|otp|captcha|code|user(name)?$|search/i;

const shouldUppercase = (el) => {
    const isText = (el instanceof HTMLInputElement && el.type === 'text') || el instanceof HTMLTextAreaElement;
    if (!isText || el.readOnly || el.closest('[data-no-uppercase]')) return false;
    return !SKIP.test(`${el.name} ${el.id} ${el.getAttribute('autocomplete') || ''} ${el.placeholder}`);
};

const uppercase = (el) => {
    const upper = el.value.toUpperCase();
    if (upper === el.value) return false;
    const { selectionStart, selectionEnd } = el;
    // Use the native setter so React still sees the change and fires onChange with the new value
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, upper);
    el.setSelectionRange(selectionStart, selectionEnd);
    return true;
};

if (typeof document !== 'undefined') {
    // Capture phase on document runs before React's listeners on #root
    document.addEventListener('input', (e) => {
        if (e.isComposing || !shouldUppercase(e.target)) return;
        uppercase(e.target);
    }, true);

    // Mobile/IME keyboards: convert once composition finishes, then let React pick it up
    document.addEventListener('compositionend', (e) => {
        if (shouldUppercase(e.target) && uppercase(e.target)) {
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, true);
}
