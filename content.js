// goon4cf autodrainer
// Auto-purchases from https://throne.com/goon4cf
// Pulls items from Throne wishlist: Key, Coffee, Lunch, Beer Money, Date Night
// Images sourced from: https://goon4cfpics-production.up.railway.app/

const STORAGE_KEY = "extension_selected_item";
const SESSION_PROMPT_KEY = "extension_prompt_shown";
const CARD_ID_ATTR = "data-extension-card-id";
let customNameSetup = false;  // Track if custom name has been set

// Goon4CF's wishlist items from https://throne.com/goon4cf
const ALLOWED_ITEMS = ["Tip", "Coffee", "Lunch", "Beer Money", "Date Night"];
const EMOJI_LABELS = {
  "Tip": "Tip ($5.00)",
  "Coffee": "Coffee ($9.98)",
  "Lunch": "Lunch ($21.95)",
  "Beer Money": "Beer Money ($54.88)",
  "Date Night": "Date Night ($109.75)"
};

const ALLOWED_SET = new Set(ALLOWED_ITEMS);
let selectedItem = localStorage.getItem(STORAGE_KEY) || null;
let awaitingSelection = false;
let cardCounter = 0;

// Create modal for item selection
function showChoiceModal(options, onConfirm, onCancel, defaultValue) {
  const existingModal = document.getElementById("extension-choice-modal");
  if (existingModal) existingModal.remove();

  const modal = document.createElement("div");
  modal.id = "extension-choice-modal";
  modal.style.position = "fixed";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0, 0, 0, 0.5)";
  modal.style.zIndex = "10001";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.pointerEvents = "auto";

  const content = document.createElement("div");
  content.style.background = "#fff";
  content.style.color = "#000";
  content.style.padding = "40px";
  content.style.borderRadius = "12px";
  content.style.minWidth = "280px";
  content.style.maxWidth = "90%";
  content.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.3)";
  content.style.fontFamily = "sans-serif";

  const title = document.createElement("div");
  title.textContent = "Choose an item to add to cart";
  title.style.fontWeight = "600";
  title.style.marginBottom = "20px";
  title.style.fontSize = "16px";

  const select = document.createElement("select");
  select.style.width = "100%";
  select.style.marginBottom = "20px";
  select.style.padding = "8px";
  select.style.borderRadius = "4px";
  select.style.border = "1px solid #ddd";
  select.style.fontSize = "14px";

  options.forEach(opt => {
    const o = document.createElement("option");
    if (typeof opt === "string") {
      o.value = opt;
      o.textContent = opt;
    } else {
      o.value = opt.value;
      o.textContent = opt.label;
    }
    select.appendChild(o);
  });

  if (defaultValue) {
    select.value = defaultValue;
  }

  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.justifyContent = "flex-end";
  buttons.style.gap = "8px";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.padding = "8px 16px";
  cancelBtn.style.background = "#f0f0f0";
  cancelBtn.style.border = "none";
  cancelBtn.style.borderRadius = "4px";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.onclick = () => {
    modal.remove();
    onCancel && onCancel();
  };

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Start Drain";
  confirmBtn.style.padding = "8px 16px";
  confirmBtn.style.background = "#ff69b4";
  confirmBtn.style.color = "white";
  confirmBtn.style.border = "none";
  confirmBtn.style.borderRadius = "4px";
  confirmBtn.style.cursor = "pointer";
  confirmBtn.style.fontWeight = "600";
  confirmBtn.onclick = () => {
    const value = select.value;
    modal.remove();
    onConfirm && onConfirm(value);
  };

  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);

  content.appendChild(title);
  content.appendChild(select);
  content.appendChild(buttons);
  modal.appendChild(content);
  document.body.appendChild(modal);
  select.focus();
}

// Scan for items on page
function scanAllowedItems() {
  const found = [];
  const seenSet = new Set();

  // Search all text nodes for item names
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let node;
  const textNodes = [];
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }

  // For each allowed item, find its text and locate the associated "Add to cart" button
  for (const itemName of ALLOWED_ITEMS) {
    if (seenSet.has(itemName)) continue;

    // Find text node containing the item name
    for (const textNode of textNodes) {
      const text = textNode.textContent.trim();
      if (text === itemName) {
        // Found the item, now find its card container and button
        let container = textNode.parentElement;
        
        // Walk up the DOM to find the card container
        while (container && !container.querySelector("button")) {
          container = container.parentElement;
        }

        if (container) {
          // Find the "Add to cart" button within this container
          const addBtn = container.querySelector("button");
          if (addBtn && addBtn.textContent.includes("Add to cart")) {
            seenSet.add(itemName);
            let cardId = container.getAttribute(CARD_ID_ATTR);
            
            if (!cardId) {
              cardId = "ext_card_" + (cardCounter++);
              try {
                container.setAttribute(CARD_ID_ATTR, cardId);
              } catch (e) {}
            }

            found.push({
              text: itemName,
              card: container,
              cardId: cardId,
              item: itemName,
              button: addBtn
            });
            break;
          }
        }
      }
    }
  }

  return found;
}

// Initialize selection and start
function initSelectionThenStart() {
  if (sessionStorage.getItem(SESSION_PROMPT_KEY) === "1") {
    startMainLoop();
    return;
  }

  setTimeout(() => {
    const attemptSelection = () => {
      const found = scanAllowedItems();
      const options = found.map(f => ({
        value: f.cardId,
        label: EMOJI_LABELS[f.item] || f.item,
        item: f.item,
        cardId: f.cardId
      }));

      if (options.length > 0) {
        if (awaitingSelection) return;
        awaitingSelection = true;

        const savedCardId = localStorage.getItem(`${STORAGE_KEY}_card`);
        const defaultValue = savedCardId && options.some(o => o.value === savedCardId) ? savedCardId : null;

        showChoiceModal(options, (choiceCardId) => {
          awaitingSelection = false;
          sessionStorage.setItem(SESSION_PROMPT_KEY, "1");

          if (!choiceCardId) {
            setTimeout(attemptSelection, 2000);
            return;
          }

          const matched = options.find(o => o.value === choiceCardId);
          if (matched) {
            selectedItem = matched.item;
            localStorage.setItem(STORAGE_KEY, selectedItem);
            localStorage.setItem(`${STORAGE_KEY}_card`, choiceCardId);
            startMainLoop();
          } else {
            setTimeout(attemptSelection, 2000);
          }
        }, () => {
          awaitingSelection = false;
          setTimeout(attemptSelection, 2000);
        }, defaultValue);
      } else {
        setTimeout(attemptSelection, 2000);
      }
    };

    attemptSelection();
  }, 1000);
}

// Click "add to cart" for selected item
function clickAddToCart() {
  setTimeout(() => {
    if (!selectedItem) return;

    const savedCardId = localStorage.getItem(`${STORAGE_KEY}_card`);
    if (savedCardId) {
      const card = document.querySelector(`[${CARD_ID_ATTR}="${savedCardId}"]`);
      if (card) {
        const addBtn = card.querySelector("button");
        if (addBtn && addBtn.textContent.includes("Add to cart") && !addBtn.disabled) {
          console.log("Clicking add to cart for:", selectedItem);
          addBtn.click();
          return;
        }
      }
    }

    // Fallback: rescan and find the item
    const items = scanAllowedItems();
    for (const item of items) {
      if (item.item === selectedItem && item.button) {
        if (!item.button.disabled) {
          console.log("Clicking matched item:", selectedItem);
          item.button.click();
          return;
        }
      }
    }
  }, 1500);
}

// Click checkout
function clickCheckout() {
  setTimeout(() => {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const text = (btn.textContent || "").trim().toLowerCase();
      if (text.includes("checkout")) {
        console.log("Clicking checkout...");
        btn.click();
        return;
      }
    }
  }, 2000);
}

// Click "Use Custom Name" and fill in autodrainer
function setupCustomName() {
  if (customNameSetup) {
    console.log("✓ Custom name already set up, skipping...");
    return;
  }
  
  setTimeout(() => {
    // Click the Anonymous dropdown
    const dropdownBtn = Array.from(document.querySelectorAll("button")).find(btn => 
      btn.textContent.includes("Anonymous")
    );
    
    if (dropdownBtn) {
      console.log("Clicking Anonymous dropdown...");
      dropdownBtn.click();
      
      // Wait for menu to appear, then click "Use Custom Name"
      setTimeout(() => {
        // Look for all divs/buttons that might contain the menu option
        const allElements = document.querySelectorAll("*");
        let customNameOption = null;
        
        for (let el of allElements) {
          // Check direct text content (not children)
          if (el.childNodes.length > 0) {
            for (let node of el.childNodes) {
              if (node.nodeType === 3 && node.textContent.trim() === "Use Custom Name") {
                customNameOption = el.closest("div[role='menuitem'], button, div[class*='menu']") || el.parentElement;
                break;
              }
            }
          }
          if (customNameOption) break;
        }
        
        // Fallback: search by text
        if (!customNameOption) {
          for (let el of allElements) {
            if (el.textContent.trim() === "Use Custom Name" && (el.tagName === "DIV" || el.tagName === "BUTTON")) {
              customNameOption = el;
              break;
            }
          }
        }
        
        if (customNameOption) {
          console.log("Found Use Custom Name, clicking...");
          customNameOption.click();
          
          // Wait for modal, then fill in the custom name
          setTimeout(() => {
            const input = document.querySelector("input[placeholder='Custom Name']") || 
                         document.querySelector("input[type='text']");
            
            if (input) {
              console.log("Filling custom name: autodrainer");
              input.focus();
              input.value = "autodrainer";
              input.dispatchEvent(new Event("input", { bubbles: true }));
              input.dispatchEvent(new Event("change", { bubbles: true }));
              input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
              
              // Click Save button
              setTimeout(() => {
                const saveBtn = Array.from(document.querySelectorAll("button")).find(btn =>
                  btn.textContent.trim() === "Save"
                );
                if (saveBtn && !saveBtn.disabled) {
                  console.log("Clicking Save...");
                  saveBtn.click();
                  customNameSetup = true;  // Mark as complete
                  console.log("✓ Custom name setup complete!");
                }
              }, 600);
            } else {
              console.log("⚠️ Custom name input not found");
            }
          }, 800);
        } else {
          console.log("⚠️ Use Custom Name option not found");
        }
      }, 800);
    } else {
      console.log("⚠️ Anonymous dropdown not found");
    }
  }, 1000);
}

// Click pay now
function clickPayNow() {
  setTimeout(() => {
    const buttons = document.querySelectorAll("button");
    for (const btn of buttons) {
      const span = btn.querySelector("span");
      if (span && span.textContent.trim().toLowerCase() === "pay now" && !btn.disabled) {
        console.log("Clicking pay now...");
        btn.click();
        return;
      }
    }
  }, 2000);
}

// Spawn random images
function spawnImage() {
  // Fetch random image from image service
  const imageServiceUrl = "https://goon4cfpics-production.up.railway.app/api/random-image";
  
  fetch(imageServiceUrl)
    .then(r => r.json())
    .then(data => {
      const img = document.createElement("img");
      const fullUrl = data.url.startsWith('http') ? data.url : 'https://goon4cfpics-production.up.railway.app' + data.url;
      img.src = fullUrl;
      img.style.position = "fixed";
      img.style.pointerEvents = "none";
      img.style.zIndex = "10000";
      img.style.maxWidth = "400px";
      img.style.maxHeight = "400px";
      img.style.width = "auto";
      img.style.height = "auto";
      img.style.objectFit = "contain";
      img.style.left = Math.random() * Math.max(0, window.innerWidth - 400) + "px";
      img.style.top = Math.random() * Math.max(0, window.innerHeight - 400) + "px";
      img.style.borderRadius = "8px";
      img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

      document.body.appendChild(img);
      // Keep open - don't remove after timeout
    })
    .catch(e => console.log("Image fetch error:", e));
}

// Main loop
function mainLoop() {
  const url = window.location.href;

  if (url.includes("checkout")) {
    if (!customNameSetup) {
      setupCustomName();  // Setup custom name only once
    } else {
      clickPayNow();  // Once setup is done, proceed to pay
    }
  } else if (url.includes("goon4cf")) {
    // Reset custom name flag when back on the main page
    customNameSetup = false;
    clickAddToCart();
    clickCheckout();
  }

  setTimeout(mainLoop, 3000);
}

// Start everything
function startMainLoop() {
  mainLoop();
  
  // Spawn 10 images instantly
  for (let i = 0; i < 10; i++) {
    spawnImage();
  }
  
  // Then spawn 1 every 0.25 seconds
  setInterval(spawnImage, 250);
}

// Debug: log when extension loads
console.log("🎀 goon4cf auto drainer loaded. Looking for items...");
setTimeout(() => {
  const found = scanAllowedItems();
  console.log(`Found ${found.length} items:`, found.map(f => f.item));
}, 500);

// Begin
initSelectionThenStart();
