---
layout: hiddenpage
title: Olympic
sidebar_link: false
---

# Medal Table for Oxley

<div class="banner">
  <img src="https://olympics.com/en/paris-2024/medals" alt="Paris 2024 Banner" class="banner-image">
</div>

<div id="medalTable"></div>

<script src="olympic.js"></script>

<style>
  .banner {
    text-align: center;
    margin-bottom: 20px;
  }

  .banner-image {
    width: 100%;
    max-width: 800px;
    height: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
  }

  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: #f2f2f2;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  .person-cell {
    font-size: 20px;
    padding: 5px;
  }

  .countries-cell {
    font-size: 18px;
    padding: 5px;
  }

  .points-cell {
    font-size: 20px;
    padding: 5px;
  }

  .country-name {
    font-size: 24px;
  }

  .medal-count {
    font-size: 18px;
  }
</style>
