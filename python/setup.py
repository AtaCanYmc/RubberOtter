from setuptools import setup, find_packages

setup(
    name="rubberotter",
    version="1.2.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "pyserial>=3.5",
        "bleak>=0.20.0",
        "flask>=3.0.0",
    ],
    entry_points={
        "console_scripts": [
            "rubberotter=rubberotter.cli:main",
            "otter-cli=rubberotter.cli:main",
        ],
    },
)
