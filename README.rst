.. image:: https://github.com/frontierhq/sheriff-azure-devops-extension/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/frontierhq/sheriff-azure-devops-extension/actions/workflows/ci.yml
.. image:: https://github.com/frontierhq/sheriff-azure-devops-extension/actions/workflows/release.yml/badge.svg
    :target: https://github.com/frontierhq/sheriff-azure-devops-extension/actions/workflows/release.yml

|

.. image:: images/extension-icon.png
  :width: 200
  :alt: Sheriff logo
  :align: center

==============================
Sheriff Azure DevOps Extension
==============================

-----
About
-----

This is an Azure DevOps extension that provides tasks for installing and running
`Sheriff <https://github.com/frontierhq/sheriff>`_, a command line tool to
manage Microsoft Entra Privileged Identity Management (Microsoft Entra PIM) using
desired state configuration.

------------
Installation
------------

The extension is available in the `Visual Studio Marketplace <https://marketplace.visualstudio.com/items?itemName=gofrontier.Sheriff>`_.

-----
Usage
-----

~~~~~~~~~~~~~~~~~~~~~~
InstallSheriffCLI task
~~~~~~~~~~~~~~~~~~~~~~

This task installs the Sheriff CLI on the agent. The ``version`` input accepts either
``latest`` or a specific version number in the format ``vA.B.C``, e.g. ``v0.1.0``.

.. code:: yaml

  - task: InstallSheriffCLI@0
    displayName: Install Sheriff CLI
    inputs:
      version: latest

~~~~~~~~~~~~~~~~
SheriffPlan task
~~~~~~~~~~~~~~~~

This task runs Sheriff in plan mode, equivalent to running ``sheriff plan [mode]``.

.. code:: yaml

  - task: SheriffPlan@0
    displayName: Plan Sheriff changes
    inputs:
      configDir: $(System.DefaultWorkingDirectory)/.config
      mode: azurerm
      serviceConnectionName: <service connection name>

~~~~~~~~~~~~~~~~~
SheriffApply task
~~~~~~~~~~~~~~~~~

This task runs Sheriff in apply mode, equivalent to running ``sheriff apply [mode]``.

.. code:: yaml

  - task: SheriffApply@0
    displayName: Apply Sheriff changes
    inputs:
      configDir: $(System.DefaultWorkingDirectory)/.config
      mode: azurerm
      serviceConnectionName: <service connection name>

------------
Contributing
------------

We welcome contributions to this repository. Please see `CONTRIBUTING.md <https://github.com/frontierhq/sheriff-azure-devops-extension/tree/main/CONTRIBUTING.md>`_ for more information.
