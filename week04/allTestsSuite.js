
import { total }      from "../kolibri-dist-2026-02-15/kolibri/util/test.js";
import { versionInfo} from "../kolibri-dist-2026-02-15/kolibri/version.js";


import './todo/todoTest.js'
import './person/personTest.js'

import '../kolibri-dist-2026-02-15/kolibri/allKolibriTestsSuite.js';

total.onChange( value => document.getElementById('grossTotal').textContent = "" + value + " tests done.");

document.querySelector("footer").textContent = "Built with Kolibri " + versionInfo;
