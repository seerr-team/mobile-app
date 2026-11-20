{
  pkgs,
  lib,
  config,
  ...
}:
{
  languages.javascript = {
    enable = true;
    # package.json engines: "node": "^22.13.0"
    package = pkgs.nodejs_22;
    # The project uses npm (package-lock.json, `npm ci` in CI).
    npm = {
      enable = true;
      install.enable = true;
    };
  };

  android = {
    enable = true;
    reactNative.enable = true;
    platforms.version = [ "37" ];
    # 37.0.0: app (RN default). 36.0.0: AGP 9.2.1 default, used by modules
    # that don't set buildToolsVersion (e.g. :expo).
    buildTools.version = [ "37.0.0" "36.0.0" ];
    ndk.version = [ "27.1.12297006" ];
    cmake.version = [ "3.22.1" ];
    emulator.enable = false;
    systemImages.enable = false;
    googleAPIs.enable = false;
    googleTVAddOns.enable = false;
  };

  env.ANDROID_SDK_ROOT = config.env.ANDROID_HOME;
}
