import { Construct } from 'constructs';
import { App, Chart, ChartProps } from 'cdk8s';

import { KubeDeployment, KubeService, KubeNamespace, IntOrString } from './imports/k8s';
import * as fs from "fs";

export class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    const label = { app: 'hello-k8s' };

    fs.readdirSync("./data/").forEach((file) => {
      console.log(file)
      let team = JSON.parse(fs.readFileSync(`./data/${file}`, 'utf-8'))

      for (let namespace of team.namespaces) {
        new KubeNamespace(this, namespace, {
          metadata: {
            name: namespace,
            annotations: {
              "owner": team.name,
              "slack-channel": team.slack
            }
          }
        });
      }
    })

    new KubeService(this, 'service', {
      spec: {
        type: 'LoadBalancer',
        ports: [ { port: 80, targetPort: IntOrString.fromNumber(8080) } ],
        selector: label
      }
    });

    new KubeDeployment(this, 'deployment', {
      spec: {
        replicas: 2,
        selector: {
          matchLabels: label
        },
        template: {
          metadata: { labels: label },
          spec: {
            containers: [
              {
                name: 'hello-kubernetes',
                image: 'paulbouwer/hello-kubernetes:1.7',
                ports: [ { containerPort: 8080 } ]
              }
            ]
          }
        }
      }
    });

    


  }
}

const app = new App();
new MyChart(app, 'files');
app.synth();
