<?php

use ChildTheme\ChildTheme\General\Multisite;

$multisite = Multisite::getInstance();
$currentLanguage = $multisite->getCurrentLanguage();
$allLanguages = $multisite->getAllLanguages();

if ( count( $allLanguages ) <= 1 ) {
    $allLanguages = [ array_merge( $currentLanguage, [ 'url' => get_home_url(), 'is_current' => true ] ) ];
}

$switcherId = 'language-switcher-floating';

?>

<div id="<?php echo esc_attr( $switcherId ); ?>" class="language-switcher-floating" style="position: fixed; bottom: 24px; right: 24px; z-index: 9998;">
    <button 
        type="button"
        class="language-switcher__toggle"
        style="display: flex; align-items: center; gap: 8px; background: rgba(8, 19, 40, 0.95); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; padding: 12px 18px; cursor: pointer; color: #fff; font-size: 14px; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: all 0.2s;"
        aria-expanded="false"
        aria-haspopup="true"
        aria-label="Change language"
        onmouseover="this.style.borderColor='rgba(255,255,255,0.4)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 24px rgba(0,0,0,0.4)'"
        onmouseout="this.style.borderColor='rgba(255,255,255,0.2)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.3)'"
    >
        <svg style="width: 18px; height: 18px; opacity: 0.9;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
        </svg>
        <span style="text-transform: uppercase;"><?php echo esc_html( $currentLanguage['prefix'] ); ?></span>
        <svg class="language-switcher__chevron" style="width: 12px; height: 12px; transition: transform 0.2s; opacity: 0.7;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
    </button>
    
    <div 
        class="language-switcher__dropdown"
        style="position: absolute; right: 0; bottom: 100%; margin-bottom: 8px; min-width: 150px; background: rgba(8, 19, 40, 0.98); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.2s; overflow: hidden;"
    >
        <?php foreach ( $allLanguages as $language ) : ?>
            <a 
                href="<?php echo esc_url( $language['url'] ); ?>"
                style="display: flex; align-items: center; gap: 12px; padding: 14px 18px; color: #fff; text-decoration: none; transition: background 0.15s; font-size: 14px; <?php echo $language['is_current'] ? 'background: rgba(255,255,255,0.08);' : ''; ?>"
                onmouseover="this.style.background='rgba(255,255,255,0.12)'"
                onmouseout="this.style.background='<?php echo $language['is_current'] ? 'rgba(255,255,255,0.08)' : 'transparent'; ?>'"
                <?php echo $language['is_current'] ? 'aria-current="true"' : ''; ?>
            >
                <span style="font-size: 20px;"><?php echo esc_html( $language['flag'] ); ?></span>
                <span style="font-weight: 500;"><?php echo esc_html( $language['label'] ); ?></span>
                <?php if ( $language['is_current'] ) : ?>
                    <svg style="width: 14px; height: 14px; margin-left: auto; color: #4ade80;" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                <?php endif; ?>
            </a>
        <?php endforeach; ?>
    </div>
</div>

<script>
(function() {
    var switcherId = '<?php echo esc_js( $switcherId ); ?>';
    
    function initSwitcher() {
        var switcher = document.getElementById(switcherId);
        if (!switcher) return;
        
        var toggle = switcher.querySelector('.language-switcher__toggle');
        var dropdown = switcher.querySelector('.language-switcher__dropdown');
        var chevron = switcher.querySelector('.language-switcher__chevron');
        
        if (!toggle || !dropdown) return;
        
        function openDropdown() {
            toggle.setAttribute('aria-expanded', 'true');
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
            dropdown.style.transform = 'translateY(0)';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
        
        function closeDropdown() {
            toggle.setAttribute('aria-expanded', 'false');
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
            dropdown.style.transform = 'translateY(10px)';
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        }
        
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!switcher.contains(e.target)) {
                closeDropdown();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
                toggle.focus();
            }
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSwitcher);
    } else {
        initSwitcher();
    }
})();
</script>
