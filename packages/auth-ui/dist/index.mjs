// src/components/SecurityAlert.tsx
import React from "react";
function SecurityAlert({
  type,
  message,
  onClose,
  autoRedirect = true,
  redirectDelay = 3e3,
  loginPath = "/login",
  ShieldIcon,
  AlertTriangleIcon,
  XIcon
}) {
  const [countdown, setCountdown] = React.useState(Math.floor(redirectDelay / 1e3));
  React.useEffect(() => {
    if (!autoRedirect) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = loginPath;
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(timer);
  }, [autoRedirect, redirectDelay, loginPath]);
  const getAlertConfig = () => {
    switch (type) {
      case "role-changed":
        return {
          icon: ShieldIcon,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          iconColor: "text-red-600",
          titleColor: "text-red-800",
          messageColor: "text-red-700",
          title: "Access Revoked - Role Changed",
          buttonColor: "bg-red-600 hover:bg-red-700",
          progressColor: "bg-red-500"
        };
      case "account-deactivated":
        return {
          icon: AlertTriangleIcon,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          iconColor: "text-orange-600",
          titleColor: "text-orange-800",
          messageColor: "text-orange-700",
          title: "Account Deactivated",
          buttonColor: "bg-orange-600 hover:bg-orange-700",
          progressColor: "bg-orange-500"
        };
      case "session-expired":
        return {
          icon: ShieldIcon,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          iconColor: "text-yellow-600",
          titleColor: "text-yellow-800",
          messageColor: "text-yellow-700",
          title: "Session Expired",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700",
          progressColor: "bg-yellow-500"
        };
      default:
        return {
          icon: AlertTriangleIcon,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          iconColor: "text-gray-600",
          titleColor: "text-gray-800",
          messageColor: "text-gray-700",
          title: "Security Alert",
          buttonColor: "bg-gray-600 hover:bg-gray-700",
          progressColor: "bg-gray-500"
        };
    }
  };
  const config = getAlertConfig();
  const Icon = config.icon;
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" }, /* @__PURE__ */ React.createElement("div", { className: `max-w-md w-full mx-4 ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg` }, /* @__PURE__ */ React.createElement("div", { className: "p-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center" }, Icon && /* @__PURE__ */ React.createElement("div", { className: `w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center mr-3` }, /* @__PURE__ */ React.createElement(Icon, { className: `w-6 h-6 ${config.iconColor}` })), /* @__PURE__ */ React.createElement("h3", { className: `text-lg font-semibold ${config.titleColor}` }, config.title)), onClose && XIcon && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: `${config.iconColor} hover:opacity-75 transition-opacity`
    },
    /* @__PURE__ */ React.createElement(XIcon, { className: "w-5 h-5" })
  )), /* @__PURE__ */ React.createElement("div", { className: `${config.messageColor} mb-4` }, /* @__PURE__ */ React.createElement("p", { className: "text-sm leading-relaxed" }, message)), autoRedirect && /* @__PURE__ */ React.createElement("div", { className: `${config.messageColor} text-center` }, /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, "Redirecting to login in ", /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, countdown), " seconds..."), /* @__PURE__ */ React.createElement("div", { className: "mt-2 w-full bg-gray-200 rounded-full h-2" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `h-2 rounded-full transition-all duration-1000 ${config.progressColor}`,
      style: { width: `${countdown / Math.floor(redirectDelay / 1e3) * 100}%` }
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => window.location.href = loginPath,
      className: `px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${config.buttonColor}`
    },
    "Go to Login Now"
  )))));
}
var SecurityAlert_default = SecurityAlert;
export {
  SecurityAlert,
  SecurityAlert_default as SecurityAlertDefault
};
//# sourceMappingURL=index.mjs.map