pipeline {

 agent any
 environment{
    GIT_COMMIT="${env.GIT_COMMIT}"
    registryCredential = 'dockerhub'
 }
 stages {
   // stage('Test'){
   //     agent{
   //          docker{
   //              image 'node:14.17.3-stretch-slim'
   //              reuseNode true
   //          }
   //     }
   //     steps {
   //         // echo "test"
   //         sh 'npm install'
   //         sh 'npm run ci'
   //     }
   // }
    stage('Build'){
        when{
            anyOf{
                branch 'main'
                branch 'uat'
            }
        }
        agent{
            dockerfile {
                reuseNode true
            }
        }
        steps {
          script{
            sh 'npm install && npm run electron-build'
            echo "build_${env.BUILD_NUMBER}"
            def now = new Date().format("yyyyMMdd", TimeZone.getTimeZone('UTC'))
            zip zipFile: "${env.BRANCH_NAME}_${now}_${env.BUILD_NUMBER}_gscsv_desktop_test.zip", archive: false , dir: 'release-builds'
          }
        }
    }
     stage('Upload'){
        when{
            anyOf{
                branch 'main'
                branch 'uat'
            }
        }
        steps {
          script{
            GIT_COMMIT = sh (script: "git log -n 1 --pretty=format:'%h' --abbrev=7", returnStdout: true)
            def now = new Date().format("yyyyMMdd", TimeZone.getTimeZone('UTC'))
            def fileName="${env.BRANCH_NAME}_${now}_${env.BUILD_NUMBER}_gscsv_desktop_test.zip"
            sh 'mkdir -p test-git'
            sh "cp ./${fileName} ./test-git "
            dir("test-git") {
                git branch: 'main', credentialsId: 'gitlab', url: 'https://gitlab.com/gwcsv/gscsv-desktop-client-release-file.git'
              
                withCredentials([usernamePassword(credentialsId: 'gitlab', usernameVariable: 'USER', passwordVariable: 'PASSWORD')]) {
                    script {
                       env.encodedPass=URLEncoder.encode(PASSWORD, "UTF-8")
                    }
                    sh "git config --global user.email se11@gateweb.com.tw"
                    sh "git config --global user.name jenkins" 
                    sh "git remote set-url origin https://se112:${encodedPass}@gitlab.com/gwcsv/gscsv-desktop-client-release-file.git"
                    sh "git add ${fileName}"
                    sh "git commit -m ${GIT_COMMIT}"
                    sh "git push --set-upstream origin main"
                }
            }
          }
        }
    }
 }
 post { 
    success {
        script{
            def  message = "gwcsv-desktop-client success, branch: ${BRANCH_NAME} build: ${env.BUILD_NUMBER} url: https://gitlab.com/gwcsv/gscsv-desktop-client-release-file \n ${BUILD_URL}"
            googlechatnotification message: message, notifyAborted: true, notifyFailure: true, notifySuccess: true, url: 'https://chat.googleapis.com/v1/spaces/AAAAUJnUGOQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=STEU-aMWg3oVs1xTd6OVvjwK2j-iCxhQAQuc3e6MkSc%3D'
        }
      }
    failure {
        script{
            def message = "gwcsv-desktop-client failed, branch: ${BRANCH_NAME} build: ${env.BUILD_NUMBER} \n ${BUILD_URL}"
            googlechatnotification message: message, notifyAborted: true, notifyFailure: true, notifySuccess: true, url: 'https://chat.googleapis.com/v1/spaces/AAAAUJnUGOQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=STEU-aMWg3oVs1xTd6OVvjwK2j-iCxhQAQuc3e6MkSc%3D'
        }
    }
  }
}
