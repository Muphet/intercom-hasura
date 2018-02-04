# Intercom Webhook
Implementation of a front-end use case for Intercom with ReactJS.

### Building
Download `nodejs` and `npm` for your platform:

| Platform | Command |
| -------- | ------- |
| Ubuntu | `sudo apt-get install nodejs npm` |
| Fedora | `sudo dnf install nodejs npm` |

Clone this repository:
```
git clone https://github.com/methusael13/intercom-hasura.git
```

Add your cluster:
```
hasura cluster add <cluster-name> <alias>
```

Set your cluster to be default:
```
hasura cluster set-default <alias>
```

Modify cluster data:
- Set cluster name in `microservices/ui/app/src/components/Config.js`
- Set cluster name in `microservices/ui/app/package.json`

Deploy to Hasura:
```
git push <alias> master
```

Open your favourite browser and browse to `https://ui.cluster-name.hasura-app.io`
