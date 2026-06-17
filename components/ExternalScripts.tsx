'use client';

import Script from 'next/script';

export default function ExternalScripts() {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
        strategy="lazyOnload"
      />
    </>
  );
}
