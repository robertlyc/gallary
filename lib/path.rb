require 'yaml'
APP_CONFIG = YAML.load_file(File.join(File.dirname(__FILE__), '../config/config.yml'))['development']

module Sass::Script::Functions

  def path(source, only_path = Sass::Script::Bool.new(false))
    source = source.value
    prefix = ''

    unless source.start_with?('/images/', 'http')
      source = File.join(APP_CONFIG['assets_dir'], source)
      prefix = '/images/'
    end

    source = "url(#{prefix + source})" unless only_path.to_bool
    Sass::Script::String.new(source)
  end

end
