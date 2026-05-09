import BaseTheme from './theme/theme';
import * as Header from './theme/modules/header';
import * as NavbarAutoHiding from './theme/modules/navbar-auto-hiding';
import * as NavbarScrollCollapse from './theme/modules/navbar-scroll-collapse';

require('./bootstrap-modules');

let theme = window.BaseTheme = new BaseTheme();

// Register theme modules
theme.registerPlugin(Header.PluginName, Header.Plugin);
theme.registerPlugin(NavbarAutoHiding.PluginName, NavbarAutoHiding.Plugin);
theme.registerPlugin(NavbarScrollCollapse.PluginName, NavbarScrollCollapse.Plugin);

// Queue theme modules
//theme.queuePlugin(Header.PluginName);