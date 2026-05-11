<?php
/**
 * Form Popup Template
 * This popup is triggered by buttons with data-form-popup="true"
 * Two-column layout: Left side with content, Right side with form
 */
$popupTitle       = get_field( 'popup_title', 'option' ) ?: baseTheme()->__( "Let's Build Something Great Together" );
$popupDescription = get_field( 'popup_description', 'option' ) ?: baseTheme()->__( "Tell us about your project and we'll get back to you within 24 hours with a free consultation." );
$popupFeatures    = get_field( 'popup_features', 'option' ) ?: [];
$defaultFormId    = get_field( 'popup_default_form_id', 'option' ) ?: '';
?>

<!-- Form Popup Overlay -->
<div id="form-popup-overlay" class="tw-fixed tw-inset-0 tw-bg-core/90 tw-backdrop-blur-md tw-z-[9998] tw-hidden tw-opacity-0 tw-transition-opacity tw-duration-300"></div>

<!-- Form Popup Modal -->
<div id="form-popup-modal" class="tw-fixed tw-inset-0 tw-z-[9999] tw-hidden tw-flex tw-items-center tw-justify-center tw-p-4 md:tw-p-8 tw-overflow-y-auto">
    <div class="form-popup-content font--jakarta tw-bg-focus tw-rounded-3xl tw-shadow-2xl tw-w-full tw-max-w-4xl tw-max-h-[90vh] tw-overflow-hidden tw-transform tw-scale-95 tw-opacity-0 tw-transition-all tw-duration-300 tw-relative tw-my-auto">

        <!-- Close Button -->
        <button id="form-popup-close" class="tw-absolute tw-top-4 tw-right-4 tw-z-10 tw-w-10 tw-h-10 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-bg-gray-01 tw-text-gray-02 hover:tw-bg-primary hover:tw-text-white tw-transition-all tw-cursor-pointer tw-border-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>

        <div class="tw-flex tw-flex-col md:tw-flex-row tw-h-full tw-max-h-[90vh] tw-overflow-y-auto md:tw-overflow-hidden">
            <!-- Left Side: Content -->
            <div class="tw-w-full md:tw-w-5/12 tw-p-8 md:tw-p-10 tw-flex tw-flex-col tw-justify-center" style="background: linear-gradient(135deg, #081328 0%, #004CA8 100%);">
                <h2 class="tw-text-focus tw-text-2xl md:tw-text-3xl tw-font-extrabold tw-mb-4 tw-leading-tight tw-normal-case tw-tracking-normal">
                    <?php echo esc_html( $popupTitle ); ?>
                </h2>
                <p class="tw-text-focus-70 tw-text-base tw-leading-relaxed tw-mb-8">
                    <?php echo esc_html( $popupDescription ); ?>
                </p>

                <?php if ( ! empty( $popupFeatures ) ) : ?>
                    <ul class="tw-list-none tw-p-0 tw-m-0 tw-space-y-3">
                        <?php foreach ( $popupFeatures as $feature ) : ?>
                            <li class="tw-flex tw-items-center tw-gap-3 tw-text-focus tw-text-sm">
                                <svg class="tw-w-5 tw-h-5 tw-text-edge tw-flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                </svg>
                                <?php echo esc_html( $feature['popup_feature_text'] ); ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>

            <!-- Right Side: Form -->
            <div class="tw-w-full md:tw-w-7/12 tw-p-8 md:tw-p-10 tw-bg-focus md:tw-overflow-y-auto md:tw-max-h-[90vh] !tw-text-core">
                <h3 class="!tw-text-core tw-text-xl tw-font-bold tw-mb-6 tw-normal-case tw-tracking-normal"><?php echo esc_html( baseTheme()->__( 'Send us a message' ) ); ?></h3>
                <div id="form-popup-body" class="form-popup-styled">
                    <!-- Form content loaded dynamically -->
                    <div class="tw-flex tw-justify-center tw-py-12">
                        <div class="tw-animate-spin tw-w-8 tw-h-8 tw-border-4 tw-border-primary tw-border-t-transparent tw-rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Form Styling -->
<style>
.form-popup-styled input[type="text"],
.form-popup-styled input[type="email"],
.form-popup-styled input[type="tel"],
.form-popup-styled input[type="url"],
.form-popup-styled input[type="number"],
.form-popup-styled textarea,
.form-popup-styled select {
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #F8F9FA;
    border: 2px solid #E9ECEF;
    border-radius: 0.75rem;
    color: #081328;
    transition: all 0.2s ease;
    outline: none;
}

.form-popup-styled input[type="text"]:focus,
.form-popup-styled input[type="email"]:focus,
.form-popup-styled input[type="tel"]:focus,
.form-popup-styled input[type="url"]:focus,
.form-popup-styled input[type="number"]:focus,
.form-popup-styled textarea:focus,
.form-popup-styled select:focus {
    border-color: #004CA8;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(0, 76, 168, 0.1);
}

.form-popup-styled input::placeholder,
.form-popup-styled textarea::placeholder {
    color: #6C757D;
}

.form-popup-styled textarea {
    min-height: 120px;
    resize: vertical;
}

.form-popup-styled label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #081328 !important;
    margin-bottom: 0.5rem;
}

/* Force all text in form area to be dark */
.form-popup-styled,
.form-popup-styled * {
    color: #081328;
}

.form-popup-styled label,
.form-popup-styled .wpforms-field-label,
.form-popup-styled .wpforms-field-sublabel,
.form-popup-styled legend,
.form-popup-styled p,
.form-popup-styled span:not(.wpforms-required-label) {
    color: #081328 !important;
}

.form-popup-styled .wpforms-field,
.form-popup-styled .gfield,
.form-popup-styled .wpcf7-form-control-wrap {
    margin-bottom: 1.25rem;
}

.form-popup-styled button[type="submit"],
.form-popup-styled input[type="submit"],
.form-popup-styled .wpforms-submit,
.form-popup-styled .gform_button,
.form-popup-styled .wpcf7-submit {
    width: 100%;
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
    background: linear-gradient(135deg, #004CA8 0%, #018FDC 100%);
    color: #fff;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.form-popup-styled button[type="submit"]:hover,
.form-popup-styled input[type="submit"]:hover,
.form-popup-styled .wpforms-submit:hover,
.form-popup-styled .gform_button:hover,
.form-popup-styled .wpcf7-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 76, 168, 0.3);
}

.form-popup-styled .wpforms-required-label,
.form-popup-styled .gfield_required {
    color: #DC3545;
}

.form-popup-styled .wpforms-error,
.form-popup-styled .validation_error,
.form-popup-styled .wpcf7-not-valid-tip {
    color: #DC3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

.form-popup-styled .wpforms-confirmation-container-full,
.form-popup-styled .gform_confirmation_message {
    padding: 1.5rem;
    background: #D4EDDA;
    border-radius: 0.75rem;
    color: #155724;
    text-align: center;
}

/* Hide WPForms hidden fields, honeypot, and duplicate elements */
.form-popup-styled .wpforms-field-hidden,
.form-popup-styled .wpforms-field-hp,
.form-popup-styled .wpforms-screen-reader-element,
.form-popup-styled input[type="hidden"],
.form-popup-styled .wpforms-field-honeypot,
.form-popup-styled .wpforms-recaptcha-container,
.form-popup-styled .wpforms-pagebreak-top,
.form-popup-styled .wpforms-field[style*="display: none"],
.form-popup-styled .wpforms-field[style*="display:none"] {
    display: none !important;
    visibility: hidden !important;
    position: absolute !important;
    left: -9999px !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
}

/* WPForms honeypot field - it's always field ID 1 and is a simple text field before the real name field */
.form-popup-styled .wpforms-field-text[data-field-id="1"] {
    display: none !important;
}

/* Also hide any wpforms-field-text that is immediately followed by wpforms-field-name (honeypot pattern) */
.form-popup-styled .wpforms-field-container > .wpforms-field-text:first-child {
    display: none !important;
}

/* Hide WPForms duplicate submit buttons */
.form-popup-styled .wpforms-submit-container {
    margin-top: 1.5rem;
}

.form-popup-styled .wpforms-container .wpforms-form .wpforms-submit-container button {
    margin: 0;
}

/* Ensure only one submit button is visible */
.form-popup-styled .wpforms-submit-container .wpforms-submit + .wpforms-submit {
    display: none !important;
}

/* Hide page indicators if not needed */
.form-popup-styled .wpforms-page-indicator {
    display: none;
}

/* Fix for fields that should be hidden via WPForms conditional logic */
.form-popup-styled .wpforms-conditional-hide {
    display: none !important;
}

/* Hide WPForms sublabels if they duplicate the main label */
.form-popup-styled .wpforms-field-sublabel {
    display: none;
}

/* Fix Name field layout (First/Last name) */
.form-popup-styled .wpforms-field-name .wpforms-field-row {
    display: flex;
    gap: 1rem;
}

.form-popup-styled .wpforms-field-name .wpforms-field-row .wpforms-field-row-block {
    flex: 1;
}

/* Hide duplicate description text */
.form-popup-styled .wpforms-field-description {
    font-size: 0.75rem;
    color: #6C757D;
    margin-top: 0.25rem;
}

/* Ensure proper field container display */
.form-popup-styled .wpforms-field-container {
    display: block;
}

/* Hide any visually hidden elements */
.form-popup-styled [aria-hidden="true"],
.form-popup-styled .wpforms-hidden,
.form-popup-styled .screen-reader-text {
    display: none !important;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('form-popup-overlay');
    const modal = document.getElementById('form-popup-modal');
    const popupContent = modal ? modal.querySelector('.form-popup-content') : null;
    const popupBody = document.getElementById('form-popup-body');
    const closeBtn = document.getElementById('form-popup-close');
    const defaultFormId = '<?php echo esc_js( $defaultFormId ); ?>';

    if (!overlay || !modal || !popupContent) return;

    // Form shortcodes cache
    const formCache = {};

    // Open popup
    function openPopup(formId) {
        const useFormId = formId || defaultFormId;

        if (!useFormId) {
            popupBody.innerHTML = '<p class="tw-text-gray-02 tw-text-center tw-py-8"><?php echo esc_js( baseTheme()->__( 'No form configured. Please set a form ID in the theme settings.' ) ); ?></p>';
            showPopup();
            return;
        }

        // Initialize WPForms after form is loaded into popup
        function initWPFormsInPopup(formId) {
            setTimeout(() => {
                // Hide honeypot fields
                popupBody.querySelectorAll('.wpforms-field').forEach(field => {
                    const computedStyle = window.getComputedStyle(field);
                    if (computedStyle.position === 'absolute' ||
                        computedStyle.height === '1px' ||
                        computedStyle.width === '1px') {
                        field.style.display = 'none';
                    }
                    const input = field.querySelector('input');
                    if (input) {
                        const inputStyle = window.getComputedStyle(input);
                        if (inputStyle.visibility === 'hidden') {
                            field.style.display = 'none';
                        }
                    }
                });

                const form = popupBody.querySelector('.wpforms-form');
                if (!form) return;

                // Handle form submission via WPForms AJAX endpoint
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    const submitBtn = form.querySelector('button[type="submit"], .wpforms-submit');
                    const originalText = submitBtn ? submitBtn.textContent : '';
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.textContent = '<?php echo esc_js( baseTheme()->__( 'Sending...' ) ); ?>';
                    }

                    const formData = new FormData(form);
                    formData.append('action', 'wpforms_submit');

                    fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.data && data.data.confirmation) {
                            // Show the WPForms confirmation message
                            popupBody.innerHTML = data.data.confirmation;
                            // Clear cache so form reloads fresh next time
                            delete formCache[formId];
                        } else if (data.success && data.data && data.data.redirect_url) {
                            // Handle redirect confirmation
                            popupBody.innerHTML = '<div class="wpforms-confirmation-container-full tw-text-center tw-py-8"><p><?php echo esc_js( baseTheme()->__( 'Thank you! Redirecting...' ) ); ?></p></div>';
                            delete formCache[formId];
                            setTimeout(() => {
                                window.location.href = data.data.redirect_url;
                            }, 1500);
                        } else if (!data.success && data.data && data.data.errors) {
                            // Show validation errors
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.textContent = originalText;
                            }
                            // Display general errors
                            const errorContainer = form.querySelector('.wpforms-error-container') || document.createElement('div');
                            errorContainer.className = 'wpforms-error-container';
                            errorContainer.innerHTML = '';
                            if (data.data.errors.general) {
                                for (const key in data.data.errors.general) {
                                    errorContainer.innerHTML += data.data.errors.general[key];
                                }
                            }
                            if (!form.querySelector('.wpforms-error-container')) {
                                form.insertBefore(errorContainer, form.firstChild);
                            }
                        } else {
                            // Fallback success message
                            popupBody.innerHTML = '<div class="wpforms-confirmation-container-full tw-text-center tw-py-8"><svg class="tw-w-16 tw-h-16 tw-text-green-500 tw-mx-auto tw-mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><h4 class="tw-text-xl tw-font-bold tw-mb-2"><?php echo esc_js( baseTheme()->__( 'Thank you!' ) ); ?></h4><p><?php echo esc_js( baseTheme()->__( 'Your message has been sent successfully.' ) ); ?></p></div>';
                            delete formCache[formId];
                        }
                    })
                    .catch(error => {
                        console.error('Form submission error:', error);
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalText;
                        }
                        alert('<?php echo esc_js( baseTheme()->__( 'There was an error submitting the form. Please try again.' ) ); ?>');
                    });
                });

                // Trigger Gravity Forms ready event
                if (typeof jQuery !== 'undefined') {
                    jQuery(document).trigger('gform_post_render');
                }
            }, 100);
        }

        // Load form via AJAX if not cached
        if (formCache[useFormId]) {
            popupBody.innerHTML = formCache[useFormId];
            showPopup();
            initWPFormsInPopup(useFormId);
        } else {
            popupBody.innerHTML = '<div class="tw-flex tw-justify-center tw-py-12"><div class="tw-animate-spin tw-w-8 tw-h-8 tw-border-4 tw-border-primary tw-border-t-transparent tw-rounded-full"></div></div>';
            showPopup();

            // Fetch form via AJAX
            fetch('<?php echo admin_url('admin-ajax.php'); ?>?action=get_form_shortcode&form_id=' + useFormId)
                .then(response => response.text())
                .then(html => {
                    formCache[useFormId] = html;
                    popupBody.innerHTML = html;
                    initWPFormsInPopup(useFormId);
                })
                .catch(error => {
                    popupBody.innerHTML = '<p class="tw-text-red-500 tw-text-center tw-py-8"><?php echo esc_js( baseTheme()->__( 'Error loading form. Please try again.' ) ); ?></p>';
                });
        }
    }

    function showPopup() {
        overlay.classList.remove('tw-hidden');
        modal.classList.remove('tw-hidden');
        document.body.style.overflow = 'hidden';

        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.remove('tw-opacity-0');
            popupContent.classList.remove('tw-scale-95', 'tw-opacity-0');
            popupContent.classList.add('tw-scale-100', 'tw-opacity-100');
        });
    }

    // Close popup
    function closePopup() {
        overlay.classList.add('tw-opacity-0');
        popupContent.classList.remove('tw-scale-100', 'tw-opacity-100');
        popupContent.classList.add('tw-scale-95', 'tw-opacity-0');

        setTimeout(() => {
            overlay.classList.add('tw-hidden');
            modal.classList.add('tw-hidden');
            document.body.style.overflow = '';
        }, 300);
    }

    // Event listeners for popup buttons
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-form-popup="true"]');
        if (btn) {
            e.preventDefault();
            const formId = btn.getAttribute('data-form-id');
            openPopup(formId);
        }
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    // Close on overlay click
    overlay.addEventListener('click', closePopup);

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('tw-hidden')) {
            closePopup();
        }
    });
});
</script>
