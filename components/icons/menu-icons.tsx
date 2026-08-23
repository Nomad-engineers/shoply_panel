import * as React from 'react'

const ICON_PATHS: Record<string, string> = {
  'bike': `<path d="M8.99552 15.0017C8.99552 17.2117 7.20391 19.0033 4.99385 19.0033C2.78379 19.0033 0.992188 17.2117 0.992188 15.0017C0.992188 12.7916 2.78379 11 4.99385 11C5.68937 10.9987 6.37283 11.1816 6.97468 11.5302" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="19.0017" cy="15.0017" r="4.00167" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.2514 8.49323C19.583 8.49323 19.9011 8.36148 20.1356 8.12696C20.3701 7.89244 20.5019 7.57437 20.5019 7.24271V7.24271C20.5019 6.91105 20.3701 6.59297 20.1356 6.35846C19.9011 6.12394 19.583 5.99219 19.2514 5.99219H16L19.0013 14.9959" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.99219 14.9951H10.9947L15.9968 7.99219H8.99385L4.99219 14.9951Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.99219 5.4924H9.99344" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.9934 14.9961L7.99219 5.49219" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'briefcase': `<path fill-rule="evenodd" clip-rule="evenodd" d="M16.998 20.998H6.99385C4.78379 20.998 2.99219 19.2064 2.99219 16.9964V8.99302C2.99219 7.88799 3.88799 6.99219 4.99302 6.99219H18.9989C20.1039 6.99219 20.9997 7.88799 20.9997 8.99302V16.9964C20.9997 19.2064 19.2081 20.998 16.998 20.998Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.99219 6.99385V4.99302C7.99219 3.88799 8.88799 2.99219 9.99302 2.99219H13.9947C15.0997 2.99219 15.9955 3.88799 15.9955 4.99302V6.99385" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="10" y="11" width="4.00167" height="3.00125" rx="0.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 12.4936H17.5015C19.4353 12.4936 21.0029 10.926 21.0029 8.99219V8.99219" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.9951 12.4936H6.49365C4.55984 12.4936 2.99219 10.926 2.99219 8.99219V8.99219" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'cart': `<path fill-rule="evenodd" clip-rule="evenodd" d="M17.0883 21.0046H6.9041C6.00173 21.0046 5.2114 20.4003 4.9733 19.53L3.0635 12.5271C2.71736 11.2545 3.67476 10 4.99431 10H18.9981C20.3177 10 21.2761 11.2545 20.9289 12.5271L19.0191 19.53C18.781 20.4003 17.9907 21.0046 17.0883 21.0046Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.4924 14.5078V16.5086" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.5002 14.5078V16.5086" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.998 10.0027H18.997L13.4937 3.68704C12.6954 2.77065 11.2838 2.77065 10.4875 3.68904C8.6347 5.82393 6.56084 8.23393 4.99319 10.0027H4.99219H4.99319H18.997" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'filetext': `<path fill-rule="evenodd" clip-rule="evenodd" d="M18.414 6.414L15.586 3.586C15.211 3.211 14.702 3 14.172 3H7C5.895 3 5 3.895 5 5V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V7.828C19 7.298 18.789 6.789 18.414 6.414V6.414Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9 12H15C15.552 12 16 12.448 16 13V17C16 17.552 15.552 18 15 18H9C8.448 18 8 17.552 8 17V13C8 12.448 8.448 12 9 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16 15H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13 12V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 8H15C14.448 8 14 7.552 14 7V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'history': `<path d="M8.55691 3.68733C13.1479 1.78533 18.4109 3.96633 20.3129 8.55733C22.2149 13.1483 20.0339 18.4113 15.4429 20.3133C10.8519 22.2153 5.58891 20.0343 3.68691 15.4433C1.78591 10.8523 3.96591 5.58933 8.55691 3.68733" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.7188 7.98438V12.6354L15.3747 14.8644" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'home': `<path fill-rule="evenodd" clip-rule="evenodd" d="M3.734 8.764L10.7354 3.03622C11.4722 2.43344 12.5317 2.43354 13.2684 3.03644L20.267 8.764C20.731 9.143 21 9.712 21 10.311V18C21 19.105 20.105 20 19 20H5C3.895 20 3 19.105 3 18V10.312C3 9.712 3.269 9.143 3.734 8.764Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'logout': `<path d="M8 5H6C4.895 5 4 5.895 4 7V17C4 18.105 4.895 19 6 19H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M13.431 20.952L18.431 19.848C19.348 19.646 20 18.833 20 17.895V6.10497C20 5.16697 19.348 4.35397 18.431 4.15197L13.431 3.04797C12.183 2.77197 11 3.72197 11 5.00097V19C11 20.278 12.183 21.228 13.431 20.952V20.952Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14 11V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'menu': `<path d="M9.78146 21.0078L9.78146 3.0003" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="21.0078" y="21.0078" width="18.0075" height="18.0075" rx="5" transform="rotate(180 21.0078 21.0078)" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'message': `<path fill-rule="evenodd" clip-rule="evenodd" d="M11.0997 7.05752C11.2681 6.71614 11.6158 6.5 11.9965 6.5C12.3772 6.5 12.7248 6.71614 12.8933 7.05752L13.402 8.08894C13.5477 8.38415 13.8292 8.58877 14.155 8.63611L15.2931 8.80153C15.6697 8.85631 15.9826 9.12008 16.1002 9.48199C16.2179 9.8439 16.1199 10.2412 15.8475 10.5069L15.0236 11.3106C14.788 11.5403 14.6806 11.8712 14.7362 12.1955L14.9306 13.3287C14.9949 13.7038 14.8407 14.0829 14.5329 14.3067C14.225 14.5304 13.8168 14.56 13.4799 14.3829L12.4617 13.8478C12.1704 13.6947 11.8225 13.6947 11.5313 13.8478L10.5131 14.3829C10.1762 14.56 9.76796 14.5304 9.46007 14.3067C9.15218 14.083 8.99798 13.7039 9.06229 13.3287L9.2567 12.1955C9.31232 11.8712 9.20487 11.5403 8.96934 11.3106L8.14548 10.5069C7.87308 10.2412 7.77512 9.8439 7.89277 9.48199C8.01041 9.12009 8.32327 8.85632 8.69985 8.80155L9.83799 8.63613C10.1637 8.58879 10.4453 8.38417 10.5909 8.08896L11.0997 7.05752Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M18 3H6C4.34315 3 3 4.34315 3 6V15C3 16.6569 4.34315 18 6 18H8.007V20.4429C8.007 20.6567 8.12954 20.8515 8.3222 20.9441C8.51487 21.0367 8.74357 21.0107 8.91049 20.8771L12.507 18H18C19.6569 18 21 16.6569 21 15V6C21 4.34315 19.6569 3 18 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'store': `<path d="M14.9947 8.61719V8.99234C14.9947 10.6499 13.651 11.9936 11.9934 11.9936V11.9936C10.3359 11.9936 8.99219 10.6499 8.99219 8.99234V8.61719" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.9972 8.61953V8.99469C14.9972 10.6522 16.3409 11.9959 17.9984 11.9959H18.2468C19.7672 11.9959 20.9997 10.7634 20.9997 9.24301V9.24301C20.9997 8.83504 20.8888 8.43475 20.6789 8.08492L18.279 4.08502C17.8722 3.40703 17.1395 2.99219 16.3488 2.99219H7.64305C6.85238 2.99219 6.11969 3.40703 5.71289 4.08502L3.31296 8.08491C3.10306 8.43474 2.99219 8.83503 2.99219 9.243V9.243C2.99219 10.7634 4.22471 11.9959 5.74511 11.9959H5.99344C7.65098 11.9959 8.99469 10.6522 8.99469 8.99469V8.61953" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19.8737 11.4611V18.7496C19.8737 19.9928 18.866 21.0006 17.6228 21.0006H6.36812C5.12497 21.0006 4.11719 19.9928 4.11719 18.7496V11.4609" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.6889 16.844H10.3125" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'tag': `<path fill-rule="evenodd" clip-rule="evenodd" d="M8.807 19.711H6.472C5.268 19.711 4.291 18.735 4.291 17.53V16.098C4.291 15.52 4.061 14.965 3.652 14.556L2.639 13.543C1.787 12.691 1.787 11.311 2.639 10.459L3.652 9.446C4.061 9.037 4.291 8.483 4.291 7.904V6.472C4.291 5.268 5.267 4.291 6.472 4.291H7.904C8.482 4.291 9.037 4.061 9.446 3.652L10.459 2.639C11.311 1.787 12.691 1.787 13.543 2.639L14.556 3.652C14.965 4.061 15.52 4.291 16.098 4.291H17.53C18.734 4.291 19.711 5.267 19.711 6.472V7.904C19.711 8.482 19.941 9.037 20.35 9.446L21.363 10.459C22.215 11.311 22.215 12.691 21.363 13.543L20.35 14.556C19.941 14.965 19.711 15.52 19.711 16.098V17.53C19.711 18.734 18.735 19.711 17.53 19.711H16.098C15.52 19.711 14.965 19.941 14.556 20.35L13.543 21.363C12.691 22.215 11.311 22.215 10.459 21.363L8.807 19.711Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 15L15 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.249 9C9.111 9 8.999 9.112 9 9.25C9 9.388 9.112 9.5 9.25 9.5C9.388 9.5 9.5 9.388 9.5 9.25C9.5 9.112 9.388 9 9.249 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M14.749 14.5C14.611 14.5 14.499 14.612 14.5 14.75C14.5 14.888 14.612 15 14.75 15C14.888 15 15 14.888 15 14.75C15 14.612 14.888 14.5 14.749 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'users': `<mask id="path-1-inside-1_0_263" fill="white">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.182 4.31802C16.9393 6.07538 16.9393 8.92462 15.182 10.682C13.4246 12.4393 10.5754 12.4393 8.81802 10.682C7.06066 8.92462 7.06066 6.07538 8.81802 4.31802C10.5754 2.56066 13.4246 2.56066 15.182 4.31802Z"/>
</mask>
<path d="M16.2426 3.25736C15.6569 2.67157 14.7071 2.67157 14.1213 3.25736C13.5355 3.84315 13.5355 4.79289 14.1213 5.37868L15.182 4.31802L16.2426 3.25736ZM14.1213 5.37868C14.7071 5.96447 15.6569 5.96447 16.2426 5.37868C16.8284 4.79289 16.8284 3.84315 16.2426 3.25736L15.182 4.31802L14.1213 5.37868ZM15.182 4.31802L14.1213 5.37868C15.2929 6.55025 15.2929 8.44975 14.1213 9.62132L15.182 10.682L16.2426 11.7426C18.5858 9.39949 18.5858 5.60051 16.2426 3.25736L15.182 4.31802ZM15.182 10.682L14.1213 9.62132C12.9497 10.7929 11.0503 10.7929 9.87868 9.62132L8.81802 10.682L7.75736 11.7426C10.1005 14.0858 13.8995 14.0858 16.2426 11.7426L15.182 10.682ZM8.81802 10.682L9.87868 9.62132C8.70711 8.44975 8.70711 6.55025 9.87868 5.37868L8.81802 4.31802L7.75736 3.25736C5.41421 5.60051 5.41421 9.39949 7.75736 11.7426L8.81802 10.682ZM8.81802 4.31802L9.87868 5.37868C11.0503 4.20711 12.9497 4.20711 14.1213 5.37868L15.182 4.31802L16.2426 3.25736C13.8995 0.914213 10.1005 0.914213 7.75736 3.25736L8.81802 4.31802Z" fill="currentColor" mask="url(#path-1-inside-1_0_263)"/>
<mask id="path-3-inside-2_0_263" fill="white">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.0024 13.6172C16.4074 13.6172 20.7079 15.6941 20.7079 18.8881V19.9439C20.7079 20.5268 20.2745 20.9998 19.7406 20.9998H4.26415C3.73022 20.9998 3.29688 20.5268 3.29688 19.9439V18.8881C3.29688 15.693 7.5974 13.6172 12.0024 13.6172Z"/>
</mask>
<path d="M12.0024 12.1172C11.174 12.1172 10.5024 12.7888 10.5024 13.6172C10.5024 14.4456 11.174 15.1172 12.0024 15.1172V13.6172V12.1172ZM12.0024 15.1172C12.8308 15.1172 13.5024 14.4456 13.5024 13.6172C13.5024 12.7888 12.8308 12.1172 12.0024 12.1172V13.6172V15.1172ZM12.0024 13.6172V15.1172C13.9945 15.1172 15.907 15.5913 17.2692 16.3609C18.6527 17.1425 19.2079 18.0515 19.2079 18.8881H20.7079H22.2079C22.2079 16.5306 20.6128 14.8042 18.7448 13.7489C16.8555 12.6815 14.4153 12.1172 12.0024 12.1172V13.6172ZM20.7079 18.8881H19.2079V19.9439H20.7079H22.2079V18.8881H20.7079ZM20.7079 19.9439H19.2079C19.2079 19.8623 19.2387 19.7642 19.3184 19.6772C19.4001 19.588 19.5481 19.4998 19.7406 19.4998V20.9998V22.4998C21.224 22.4998 22.2079 21.2288 22.2079 19.9439H20.7079ZM19.7406 20.9998V19.4998H4.26415V20.9998V22.4998H19.7406V20.9998ZM4.26415 20.9998V19.4998C4.45669 19.4998 4.60466 19.588 4.68633 19.6772C4.76606 19.7642 4.79688 19.8623 4.79688 19.9439H3.29688H1.79688C1.79688 21.2288 2.78076 22.4998 4.26415 22.4998V20.9998ZM3.29688 19.9439H4.79688V18.8881H3.29688H1.79688V19.9439H3.29688ZM3.29688 18.8881H4.79688C4.79688 18.0509 5.35219 17.1419 6.7355 16.3605C8.09759 15.5911 10.0102 15.1172 12.0024 15.1172V13.6172V12.1172C9.58961 12.1172 7.14944 12.6812 5.26002 13.7484C3.39182 14.8037 1.79688 16.5302 1.79688 18.8881H3.29688Z" fill="currentColor" mask="url(#path-3-inside-2_0_263)"/>`,
  'wallet': `<path fill-rule="evenodd" clip-rule="evenodd" d="M15.3365 19.005L13.6698 20.0054L12.0021 19.005L10.3344 20.0054L8.66769 19.005L7 20.0054V7H17.0042V20.0054L15.3365 19.005Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10 16.008H14.0017" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.0023 11.0033H19.0031C20.1847 10.9194 21.0778 9.89866 21.004 8.71638V5.28695C21.0778 4.10467 20.1847 3.08392 19.0031 3H4.99729C3.81568 3.08392 2.92263 4.10467 2.99645 5.28695V8.71738C2.92265 9.89947 3.81583 10.9199 4.99729 11.0033H6.99812" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.7513 11.0156L11.7314 13.0345L10.75 12.0561" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
}

interface MenuIconProps {
  name: string
  className?: string
}

export const MenuIcon = ({ name, className }: MenuIconProps) => {
  const inner = ICON_PATHS[name]
  if (!inner) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
