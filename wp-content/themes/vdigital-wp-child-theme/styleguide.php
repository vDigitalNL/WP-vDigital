<?php /* Template Name: Styleguide Page */ ?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/css/main.css">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <style>
        body {
            background-color: #4a4a4a !important;
        }
    </style>
</head>

<!-- ANY styling directly applied in this file is for temporary usage -->

<body class="styleguide">
<!-- Tabs -->
<div class="tw-flex tw-border-b tw-border-gray-300">
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-border-blue-500"
         data-tab="tab-1">
        Title & text
    </div>
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-border-transparent"
         data-tab="tab-2">
        Lists
    </div>
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-border-transparent"
         data-tab="tab-3">
        Links
    </div>
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-bord er-transparent"
         data-tab="tab-4">
        Buttons & Labels
    </div>
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-border-transparent"
         data-tab="tab-5">
        Form
    </div>
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-border-transparent"
         data-tab="tab-6">
        Form (white)
    </div>
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-border-transparent"
         data-tab="tab-7">
        WYSIWYG Example
    </div>
    <div class="tab-btn tw-text-focus tw-px-4 tw-py-2 tw-font-medium tw-border-b-2 tw-border-transparent"
         data-tab="tab-8">
        Gradients
    </div>
</div>

<div class="tw-mt-4">
    <div id="tab-1" class="tw-m-4 tab-content">
        <span class="title--large">H1 heading - Syne 120</span><br/>
        <span class="title--large header">H1 heading - Header</span>
        <h1>H1 heading — Bigshoulders 120</h1>
        <h1 class="small">H1 heading — Bigshoulders 96</h1>
        <h2>H2 heading — Bigshoulders 64</h2>
        <h3>H3 heading — Bigshoulders 40</h3>
        <h3 class="small">H3 heading — DM Sans 20</h3>
        <h4>H4 heading — DM Sans 16</h4>

        <hr class="tw-my-4">

        <p>p1 — Body text 20</p>
        <p class="txt--lead">p - Lead text</p>
        <p class="small--18">p2 — Body text 18</p>
        <p class="small--16">p3 — Body text 16</p>
    </div>

    <div id="tab-2" class="tw-m-4 tab-content tw-hidden">
        <ul>
            <li>Item #1</li>
            <li>Item #2</li>
            <li>Item #3</li>
        </ul>

        <ul class="checkmark-list">
            <li>Item #1</li>
            <li>Item #2</li>
            <li>Item #3</li>
        </ul>

        <ol>
            <li>Item #1</li>
            <li>Item #2</li>
            <li>Item #3</li>
        </ol>
    </div>

        <div id="tab-3" class="tw-m-4 tab-content tw-hidden">
            <a href="/" class="tw-text-[20px]">Hyperlink</a><br>
            <a href="/" class="dark tw-text-[20px]">Hyperlink</a><br>
            <a href="/" class="blue tw-text-[20px]">Hyperlink</a><br>
            <a href="/" class="footer tw-text-[20px]">Hyperlink</a><br>

        <a href="/" class="back">Terug naar alle pagina’s</a><br>
        <a href="/" class="next">Read all our client cases</a>
    </div>

    <div id="tab-4" class="tw-m-4 tab-content tw-hidden">
        <button class="btn">White</button>
        <button class="btn button--outline">Outline</button>
        <button class="btn button--blue">Blue</button>
        <button class="btn button--dark_outline">Dark Outline</button>
        <button class="btn button--white_outline">White Outline</button>
        <button class="btn button--green">Green</button>
        <button class="btn button--dark_green">Dark green</button>
        <button class="btn button--teal">Teal</button>
        <button class="btn button--cobalt">Cobalt</button>

        <hr class="tw-my-4">

        <div class="label">White label</div>
        <div class="label--dark">Dark label</div>

        <hr class="tw-my-4">

        <div class="tw-flex tw-gap-2">
            <button class="btn button--toggle">+</button>
            <button class="btn button--toggle--white">+</button>

            <button class="btn button--navigate">←</button>
                <button class="btn button--navigate">→</button>
                <button class="btn button--close">✕</button>
                <button class="button--close alternative">✕</button>

            <button class="btn button--play">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 10L-8.74228e-07 20L0 -7.86805e-07L18 10Z" fill="white"/>
                </svg>
            </button>
        </div>
    </div>

    <div id="tab-5" class="tw-m-4 tab-content tw-hidden">
        <div class="input__field compact">
            <label>First name</label>
            <input type="text" placeholder="First name">
        </div>

        <div class="input__select compact">
            <label>Sector</label>
            <select placeholder="Sector">
                <option value="1">Sector 1</option>
                <option value="2">Sector 2</option>
                <option value="3">Sector 3</option>
            </select>
        </div>

        <div class="input__field required compact">
            <label>First name<span>*</span></label>
            <input type="text" placeholder="First name" required="required">
        </div>

        <div class="input__field--radio compact">
            <input type="radio" name="test" value="Option A" name="option_a"/><label for="option_a">Option A</label>
        </div>

        <div class="input__field--checkbox compact">
            <input type="checkbox" value="Option C" name="option_c"/><label for="option_c">Option C</label>
        </div>

        <div class="input__field error compact">
            <label>First name</label>
            <input type="text" placeholder="First name">
        </div>

        <div class="input__select error compact">
            <label>Sector</label>
            <select placeholder="Sector">
                <option value="1">Sector 1</option>
                <option value="2">Sector 2</option>
                <option value="3">Sector 3</option>
            </select>
        </div>

        <div class="input__field required error compact">
            <label>First name<span>*</span></label>
            <input type="text" placeholder="First name" required="required">
        </div>

        <div class="input__field--radio error compact">
            <input type="radio" name="test" value="Option A" name="option_a"/><label for="option_a">Option A</label>
        </div>

        <div class="input__field--checkbox error compact">
            <input type="checkbox" value="Option C" name="option_c"/><label for="option_c">Option C</label>
        </div>
    </div>

    <div id="tab-6" class="tw-p-4 tab-content tw-hidden tw-bg-focus">
        <div class="input__field on_white">
            <label>First name</label>
            <input type="text" placeholder="First name">
        </div>

        <div class="input__select on_white">
            <label>Sector</label>
            <select placeholder="Sector">
                <option value="1">Sector 1</option>
                <option value="2">Sector 2</option>
                <option value="3">Sector 3</option>
            </select>
        </div>

        <div class="input__field required on_white">
            <label>First name<span>*</span></label>
            <input type="text" placeholder="First name" required="required">
        </div>

        <div class="input__field--radio on_white">
            <input type="radio" name="test" value="Option A" name="option_a"/><label for="option_a">Option A</label>
        </div>

        <div class="input__field--checkbox on_white">
            <input type="checkbox" value="Option C" name="option_c"/><label for="option_c">Option C</label>
        </div>

        <div class="input__field error compact on_white">
            <label>First name</label>
            <input type="text" placeholder="First name">
        </div>

        <div class="input__select error on_white">
            <label>Sector</label>
            <select placeholder="Sector">
                <option value="1">Sector 1</option>
                <option value="2">Sector 2</option>
                <option value="3">Sector 3</option>
            </select>
        </div>

        <div class="input__field required error on_white">
            <label>First name<span>*</span></label>
            <input type="text" placeholder="First name" required="required">
        </div>

        <div class="input__field--radio error on_white">
            <input type="radio" name="test" value="Option A" name="option_a"/><label for="option_a">Option A</label>
        </div>

        <div class="input__field--checkbox error on_white">
            <input type="checkbox" value="Option C" name="option_c"/><label for="option_c">Option C</label>
        </div>
    </div>

    <div id="tab-7" class="tw-m-4 tab-content tw-hidden">
        <div class="wysiwyg__content">
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>

            <p>
                This is a <strong>bold</strong>, <em>italic</em>,
                <u>underlined</u>, <s>strikethrough</s>,
                <sup>superscript</sup>, and <sub>subscript</sub> text example.
            </p>

            <p>
                This paragraph includes <span style="color:#018fdc;">colored text</span>
                and <code>inline code</code>.
            </p>

            <p>
                This is a <a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>.
            </p>

            <hr/>

            <h3>Lists</h3>

            <ul>
                <li>Unordered list item</li>
                <li>Another item
                    <ul>
                        <li>Nested list item</li>
                    </ul>
                </li>
            </ul>

            <ol>
                <li>Ordered list item</li>
                <li>Second item</li>
            </ol>

            <h3>Blockquote</h3>

            <blockquote>
                <p>This is a blockquote. Lorem ipsum dolor sit amet.</p>
                <cite>— Citation</cite>
            </blockquote>

            <h3>Alignment</h3>

            <p style="text-align:left;">Left aligned text</p>
            <p style="text-align:center;">Center aligned text</p>
            <p style="text-align:right;">Right aligned text</p>
            <p style="text-align:justify;">Justified text</p>

            <h3>Images</h3>

            <figure>
                <img src="https://placehold.co/600x400" alt="Placeholder image"/>
                <figcaption>Image caption text</figcaption>
            </figure>

            <h3>Horizontal Rule</h3>

            <hr/>

            <h3>Span with Class (useful for custom styles)</h3>

            <p>
                <span class="custom-class">This text has a custom class.</span>
            </p>

            <h3>Line Break</h3>

            <p>
                This is a line<br/>
                break example.
            </p>
        </div>
    </div>

    <div id="tab-8" class="tw-m-4 tab-content tw-hidden tw-flex tw-flex-wrap tw-justify-between">
        <div class="gradient--1" style="width: 45%; height: 800px;"></div>
        <div class="gradient--1 flip" style="width: 45%; height: 800px;"></div>

        <div class="gradient--2" style="width: 45%; height: 800px;"></div>
        <div class="gradient--2 flip" style="width: 45%; height: 800px;"></div>

        <div class="gradient--3" style="width: 45%; height: 800px;"></div>
        <div class="gradient--3 flip" style="width: 45%; height: 800px;"></div>

        <div class="gradient--4" style="width: 45%; height: 800px;"></div>
        <div class="gradient--4 flip" style="width: 45%; height: 800px;"></div>
    </div>
</div>

<script src="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/footer.js"></script>
<script>
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // Reset tabs
            tabs.forEach(t => {
                t.classList.remove('tw-border-blue-500');
                t.classList.add('tw-border-transparent');
            });

            // Hide content
            contents.forEach(c => c.classList.add('tw-hidden'));

            // Activate current
            tab.classList.remove('tw-border-transparent');
            tab.classList.add('tw-border-blue-500');
            document.getElementById(target).classList.remove('tw-hidden');
        });
    });
</script>
</body>
</html>