source "https://rubygems.org"

gem "jekyll", "~> 4.2.0"

gem "jekyll-sitemap"
gem "jekyll-dotenv"

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

gem 'eventmachine', '1.2.7', git: 'git@github.com:eventmachine/eventmachine', tag: 'v1.2.7' if Gem.win_platform? # https://github.com/oneclick/rubyinstaller2/issues/96
