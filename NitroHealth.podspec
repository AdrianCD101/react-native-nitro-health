require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "NitroHealth"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => '16.0', :visionos => 1.0 }
  s.source       = { :git => "https://github.com/AdrianCD101/react-native-nitro-health.git", :tag => "#{s.version}" }

  s.source_files = [
    "ios/**/*.h",
    # Implementation (Swift)
    "ios/**/*.swift",
    # Background bootstrap constructor (Objective-C) and Autolinking/Registration (Objective-C++)
    "ios/**/*.{m,mm}",
    # Implementation (C++ objects)
    "cpp/**/*.{hpp,cpp}",
  ]
  # SwiftPM-only unit tests — must not compile into the pod.
  s.exclude_files = "ios/Tests/**"
  s.ios.frameworks = 'HealthKit'

  load 'nitrogen/generated/ios/NitroHealth+autolinking.rb'
  add_nitrogen_files(s)

  s.dependency 'React-jsi'
  s.dependency 'React-callinvoker'
  install_modules_dependencies(s)
end
