document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".nav");

  if (menuButton && navigation) {
    const closeMenu = () => {
      navigation.classList.remove("active");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "فتح القائمة");
    };

    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("active");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "إغلاق القائمة" : "فتح القائمة"
      );
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  const yearElement = document.querySelector("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const header = document.querySelector(".header");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 25);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const quitDateInput = document.querySelector("#quit-date");
  const dailyCostInput = document.querySelector("#daily-cost");
  const calculateButton = document.querySelector("#calculate-progress");
  const feedback = document.querySelector("#tracker-feedback");
  const daysCount = document.querySelector("#days-count");
  const yearsCount = document.querySelector("#years-count");
  const monthsCount = document.querySelector("#months-count");
  const remainingDays = document.querySelector("#remaining-days");
  const moneyCount = document.querySelector("#money-count");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateToLocalInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  if (quitDateInput) {
    quitDateInput.max = dateToLocalInput(today);

    try {
      const savedDate = localStorage.getItem("nafasQuitDate");
      const savedCost = localStorage.getItem("nafasDailyCost");

      if (savedDate && savedDate <= quitDateInput.max) {
        quitDateInput.value = savedDate;
      }

      if (savedCost !== null && dailyCostInput) {
        dailyCostInput.value = savedCost;
      }
    } catch (error) {
      console.warn("تعذر استرجاع البيانات المحفوظة.");
    }
  }

  const dateFromInput = (value) => {
    const parts = value.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const addMonths = (date, amount) => {
    const result = new Date(date);
    const originalDay = result.getDate();

    result.setDate(1);
    result.setMonth(result.getMonth() + amount);

    const lastDay = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0
    ).getDate();

    result.setDate(Math.min(originalDay, lastDay));

    return result;
  };

  const updateProgress = () => {
    if (!quitDateInput || !dailyCostInput || !feedback) return;

    const dateValue = quitDateInput.value;
    const costValue = dailyCostInput.value.trim();
    const dailyCost = Number(costValue);

    if (!dateValue) {
      feedback.textContent = "اختار تاريخ الإقلاع عشان نقدر نحسب تقدّمك.";
      return;
    }

    const quitDate = dateFromInput(dateValue);

    if (Number.isNaN(quitDate.getTime()) || quitDate > today) {
      feedback.textContent = "تاريخ الإقلاع لازم يكون النهارده أو قبله.";
      return;
    }

    if (
      costValue === "" ||
      !Number.isFinite(dailyCost) ||
      dailyCost < 0 ||
      dailyCost > 100000
    ) {
      feedback.textContent = "اكتب تكلفة يومية صحيحة من صفر إلى 100000 جنيه.";
      return;
    }

    const elapsedDays = Math.floor(
      (today.getTime() - quitDate.getTime()) / 86400000
    );

    let cursor = new Date(quitDate);
    let years = 0;
    let months = 0;

    while (years < 200 && addMonths(cursor, 12) <= today) {
      cursor = addMonths(cursor, 12);
      years++;
    }

    while (months < 11 && addMonths(cursor, 1) <= today) {
      cursor = addMonths(cursor, 1);
      months++;
    }

    const days = Math.floor(
      (today.getTime() - cursor.getTime()) / 86400000
    );

    const moneySaved = elapsedDays * dailyCost;

    const formatNumber = (number) =>
      new Intl.NumberFormat("ar-EG", {
        maximumFractionDigits: 2
      }).format(number);

    if (daysCount) {
      daysCount.textContent = formatNumber(elapsedDays);
    }

    if (yearsCount) {
      yearsCount.textContent = formatNumber(years);
    }

    if (monthsCount) {
      monthsCount.textContent = formatNumber(months);
    }

    if (remainingDays) {
      remainingDays.textContent = formatNumber(days);
    }

    if (moneyCount) {
      moneyCount.textContent = formatNumber(moneySaved);
    }

    feedback.textContent = "تم تحديث حساباتك بنجاح.";

    try {
      localStorage.setItem("nafasQuitDate", dateValue);
      localStorage.setItem("nafasDailyCost", String(dailyCost));
    } catch (error) {
      console.warn("تعذر حفظ البيانات في المتصفح.");
    }
  };

  if (calculateButton) {
    calculateButton.addEventListener("click", updateProgress);
  }

  if (quitDateInput) {
    quitDateInput.addEventListener("change", updateProgress);
  }

  if (dailyCostInput) {
    dailyCostInput.addEventListener("input", updateProgress);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        if (history.replaceState) {
          history.replaceState(null, "", targetId);
        }
      }
    });
  });

  updateProgress();
});
