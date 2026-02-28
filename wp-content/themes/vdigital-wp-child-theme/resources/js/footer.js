import Topbar from "./elements/Topbar";
import Menu from "./elements/Menu";
import Footer from "./elements/Footer";
import Tagmanager from "./elements/Tagmanager";
import FacebookPixel from "./elements/FacebookPixel";
import Cookiebot from "./elements/Cookiebot";
import Overview from "./elements/Overview";
import PopupTriggers from "./elements/PopupTriggers";
import Login from "./elements/Login";
import Select from "./elements/Select";
import { addAsterixToRequiredFields } from "./functions/forms";
import Homehero from "./elements/Homehero";

const headerElement = document.querySelector("header#header");
new Topbar(headerElement);
new Menu();
new Tagmanager();
new FacebookPixel();
new Footer();
new Cookiebot();
new Overview();
window.popupTriggers = new PopupTriggers();
new Select();

if (document.querySelector(".login-section")) {
  new Login();
}

if (document.querySelector(".home-hero")) {
  new Homehero();
}

function maybeDevDomain() {
  var url = location.protocol + "//" + location.host + location.pathname;

  if (url.indexOf(".dev01.") > -1 || url.indexOf(".dev.") > -1) {
    return true;
  }

  return false;
}

addAsterixToRequiredFields();
