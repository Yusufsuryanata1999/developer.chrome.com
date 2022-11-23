/*
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Prerender by adding Speculation Rules JSON
 * Also adds a GA event so can see how many prerender attempts were made
 * versus prerender navigations.
 * @param {string} url The url to prerender
 */
function Prerender(url) {
  // Only prerender internal URLs
  if (
    !url ||
    url.toString().startsWith('http://') ||
    url.toString().startsWith('https://')
  ) {
    return '';
  }

  // Only prerender if browser supports speculationrules
  // and not in SaveData mode (Chrome should exclude SaveData
  // browser anyway, but no harm double checking)
  return `
    <script type="module">
      if (
        HTMLScriptElement.supports &&
        HTMLScriptElement.supports('speculationrules') &&
        !navigator?.connection?.saveData
      ) {
        const specScript = document.createElement('script');
        specScript.type = 'speculationrules';
        const specRules = {
          prerender: [
            {
              source: 'list',
              urls: ['${url}'],
            },
          ],
        };
        specScript.textContent = JSON.stringify(specRules);
        document.body.append(specScript);

        ga('send', 'event', {
          eventCategory: 'Site-Wide Custom Events',
          eventAction: 'Prerender attempt',
          eventValue: 1,
          eventLabel: '${url}',
          // Use a non-interaction event to avoid affecting bounce rate.
          nonInteraction: true,
        });
      }
    </script>
  `;
}

module.exports = {Prerender};
