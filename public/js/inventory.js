'use strict';

document.addEventListener('DOMContentLoaded', function() {
  const classificationList = document.querySelector("#classificationList");
  const deleteClassificationBtn = document.querySelector("#deleteClassificationBtn");
  
  if (classificationList && deleteClassificationBtn) {
    classificationList.addEventListener("change", function() {
      const classification_id = classificationList.value;
      console.log(`Selected classification_id: ${classification_id}`);
      
      // Enable/disable delete button based on selection
      deleteClassificationBtn.disabled = !classification_id;
      
      if (!classification_id) {
        document.getElementById("inventoryTableBody").innerHTML = "";
        return;
      }
      
      const classIdURL = `/inv/getInventory/${classification_id}`;
      
      fetch(classIdURL)
        .then(function(response) {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Network response was not OK");
        })
        .then(function(data) {
          console.log("Received data:", data);
          buildInventoryList(data);
        })
        .catch(function(error) {
          console.error('There was a problem:', error.message);
          document.getElementById("inventoryTableBody").innerHTML = 
            `<tr><td colspan="3">Error loading inventory: ${error.message}</td></tr>`;
        });
    });
    
    deleteClassificationBtn.addEventListener('click', function() {
      const classificationId = classificationList.value;
      if (classificationId) {
        window.location.href = `/inv/delete-classification/${classificationId}`;
      }
    });
  }

  // Initial load if there's a selected classification
  if (classificationList && classificationList.value) {
    classificationList.dispatchEvent(new Event('change'));
  }
});

function buildInventoryList(data) {
  const tableBody = document.getElementById("inventoryTableBody");
  
  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3">No vehicles found in this classification</td></tr>`;
    return;
  }
  
  let html = '';
  
  data.forEach(function(vehicle) {
    html += `
      <tr>
        <td>${vehicle.inv_make} ${vehicle.inv_model}</td>
        <td>
          <a href="/inv/edit/${vehicle.inv_id}" class="action-link modify" title="Click to update">
            Modify
          </a>
        </td>
        <td>
          <a href="/inv/delete/${vehicle.inv_id}" class="action-link delete" title="Click to delete">
            Delete
          </a>
        </td>
      </tr>
    `;
  });
  
  tableBody.innerHTML = html;
}